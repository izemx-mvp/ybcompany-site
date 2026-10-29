// Lazy chunk: only imported on the client when WebGL is available and motion is allowed.
import { Mesh, Program, Renderer, Triangle } from "ogl";

const vertex = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// Silk folds: domain-warped sine field shaded like satin; thin gold threads ride the folds.
const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uScroll;
varying vec2 vUv;

float fold(vec2 p, float t) {
  float f = sin(p.x * 1.6 + t * 0.35 + sin(p.y * 1.3 - t * 0.22) * 1.8);
  f += 0.55 * sin(p.y * 2.4 - t * 0.27 + sin(p.x * 1.1 + t * 0.18) * 2.2);
  f += 0.25 * sin((p.x + p.y) * 3.7 + t * 0.4);
  return f;
}

void main() {
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 2.4;
  float t = uTime + uScroll * 2.0;
  vec2 m = (uMouse - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 2.4;
  float md = exp(-dot(p - m, p - m) * 0.9);
  p += (p - m) * md * 0.18;

  float e = 0.01;
  float h = fold(p, t);
  float hx = fold(p + vec2(e, 0.0), t);
  float hy = fold(p + vec2(0.0, e), t);
  vec3 n = normalize(vec3((h - hx) / e * 0.18, (h - hy) / e * 0.18, 1.0));

  vec3 light = normalize(vec3(-0.4, 0.55, 0.75));
  float diff = clamp(dot(n, light), 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(-light, n), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 22.0);

  vec3 navy = vec3(0.004, 0.153, 0.31);
  vec3 deep = vec3(0.039, 0.07, 0.13);
  vec3 col = mix(deep, navy, smoothstep(0.15, 0.95, diff));
  col += vec3(0.55, 0.62, 0.78) * spec * 0.22;

  // Gold threads along iso-lines of the fold field.
  float iso = abs(fract(h * 1.6 + 0.5) - 0.5);
  float thread = smoothstep(0.018, 0.0, iso) * (0.35 + spec * 2.0);
  col += vec3(0.804, 0.631, 0.141) * thread * 0.55;
  col += vec3(0.804, 0.631, 0.141) * md * 0.05;

  // Vignette
  float v = smoothstep(1.25, 0.25, length(uv - 0.5) * 1.6);
  col *= mix(0.55, 1.0, v);
  gl_FragColor = vec4(col, 1.0);
}`;

export function mountFabric(canvasHost: HTMLElement): () => void {
  const renderer = new Renderer({
    dpr: Math.min(window.devicePixelRatio, 1.5),
    alpha: false,
    antialias: false,
  });
  const gl = renderer.gl;
  gl.canvas.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity 1.2s";
  canvasHost.appendChild(gl.canvas);

  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: [1, 1] },
      uMouse: { value: [0.5, 0.5] },
      uScroll: { value: 0 },
    },
  });
  const mesh = new Mesh(gl, { geometry, program });

  const resize = () => {
    const w = canvasHost.clientWidth;
    const h = canvasHost.clientHeight;
    renderer.setSize(w, h);
    program.uniforms["uRes"]!.value = [w, h];
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvasHost);

  const mouse = { x: 0.5, y: 0.5 };
  const target = { x: 0.5, y: 0.5 };
  const onMove = (e: PointerEvent) => {
    const r = canvasHost.getBoundingClientRect();
    target.x = (e.clientX - r.left) / r.width;
    target.y = 1 - (e.clientY - r.top) / r.height;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  let visible = true;
  const io = new IntersectionObserver(([entry]) => (visible = !!entry?.isIntersecting));
  io.observe(canvasHost);
  const onVis = () => (visible = document.visibilityState === "visible");
  document.addEventListener("visibilitychange", onVis);

  let raf = 0;
  let first = true;
  const t0 = performance.now();
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (!visible) return;
    mouse.x += (target.x - mouse.x) * 0.04;
    mouse.y += (target.y - mouse.y) * 0.04;
    program.uniforms["uTime"]!.value = (now - t0) / 1000;
    program.uniforms["uMouse"]!.value = [mouse.x, mouse.y];
    program.uniforms["uScroll"]!.value = window.scrollY / Math.max(1, window.innerHeight);
    renderer.render({ scene: mesh });
    if (first) {
      first = false;
      gl.canvas.style.opacity = "1";
    }
  };
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("visibilitychange", onVis);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    gl.canvas.remove();
  };
}
