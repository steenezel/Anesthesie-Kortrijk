import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Box, ShieldCheck, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const categories = [
  {
    title: "Protocollen",
    description: "",
    icon: BookOpen,
    href: "/protocols",
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    title: "Blocks",
    description: "",
    icon: Box,
    href: "/blocks",
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  {
    title: "BlockSafe",
    description: "LAST calculator.",
    icon: ShieldCheck,
    href: "/calculator",
    color: "bg-teal-600",
    lightColor: "bg-teal-50",
    borderColor: "border-teal-200"
  }
];

export default function Home() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
          Anesthesie <span className="text-teal-600">Kortrijk</span>
        </h1>
        <p className="text-slate-500 max-w-md mx-auto">
          
        </p>
      </div>

      <div className="grid gap-4 max-w-2xl mx-auto">
        {categories.map((category, index) => (
          <motion.div
            key={category.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={category.href}>
              <Card className={`group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 ${category.borderColor} overflow-hidden`}>
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div className={`${category.color} w-2`}></div>
                    <div className="flex-1 p-6 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className={`p-3 rounded-2xl ${category.lightColor} text-primary transition-transform group-hover:scale-110 duration-300`}>
                          <category.icon className={`h-8 w-8 ${category.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            {category.title}
                          </h2>
                          <p className="text-sm text-slate-500 line-clamp-1">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="pt-8 text-center border-t border-slate-100">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
          AZ Groeninge • Dienst Anesthesie
        </p>
      </div>
    </div>
  );
}
