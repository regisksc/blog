import { FragmentExplosionProvider } from "@/lib/providers/fragment-explosion"
import { AboutSection } from "@/components/sections/about"

export default function Page() {
  return (
    <FragmentExplosionProvider>
      <main>
        <AboutSection />
      </main>
    </FragmentExplosionProvider>
  )
}
