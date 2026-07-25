import { Portfolio } from "@/components/terminal/portfolio"
import { FragmentExplosionProvider } from "@/lib/providers/fragment-explosion"

export default function Page() {
  return (
    <FragmentExplosionProvider>
      <Portfolio />
    </FragmentExplosionProvider>
  )
}
