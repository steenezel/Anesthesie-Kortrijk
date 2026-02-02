import { Card, CardContent } from "@/components/ui/card";

export default function TailwindTest() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-5xl font-black tracking-tighter uppercase text-az-dark">
          v4 <span className="text-az-teal">Diagnostic</span>
        </h1>
        <p className="text-slate-500 font-medium">Controle van de CSS-engine en Image Optimizer</p>
      </header>

      <div className="grid gap-6">
        {/* Test 1: Custom Theme Kleuren */}
        <Card className="border-2 border-az-teal/20 shadow-xl shadow-az-teal/5">
          <CardContent className="p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-az-teal mb-2">Test 1: Theme Variables</h3>
            <div className="h-12 w-full bg-az-teal rounded-lg mb-2" />
            <p className="text-sm text-slate-600">
              Als de balk hierboven <strong>Teal</strong> is, werkt het nieuwe <code>@theme</code> blok in je CSS.
            </p>
          </CardContent>
        </Card>

        {/* Test 2: OKLCH Kleuren (v4 specifiek) */}
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Test 2: OKLCH Support</h3>
            <div className="h-12 w-full bg-[oklch(0.62_0.19_185)] rounded-lg mb-2" />
            <p className="text-sm text-slate-600">
              Deze balk gebruikt de nieuwe <strong>OKLCH</strong> kleurruimte. Dit is de modernste manier van kleurweergave in Tailwind v4.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}