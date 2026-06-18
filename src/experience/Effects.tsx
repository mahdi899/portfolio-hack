import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { LOW_TIER } from "./store";

export default function Effects() {
  if (LOW_TIER) return null;
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        intensity={0.85}
        luminanceThreshold={0.24}
        luminanceSmoothing={0.6}
        radius={0.8}
      />
      <Vignette offset={0.18} darkness={0.78} />
    </EffectComposer>
  );
}
