import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"
import type { Metadata } from "next"
import { FAQContent } from "./faq-content"

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions | Force Dowels",
  description: "Find answers to common questions about Force Dowels, including product specifications, ordering, shipping, and assembly instructions.",
}

export default function FAQPage() {
  return <FAQContent />
}

