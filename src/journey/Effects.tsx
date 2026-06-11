import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

export default function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        intensity={1.15}
        luminanceThreshold={0.17}
        luminanceSmoothing={0.65}
        radius={0.85}
      />
      <Vignette offset={0.16} darkness={0.8} />
    </EffectComposer>
  );
}
