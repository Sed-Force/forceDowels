"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"

export function FAQContent() {
  const faqs = [
    {
      question: "Do Force Dowels come in different sizes?",
      answer:
        'Currently, we offer one size for purchase: 8.3mm x 38mm (approximately 0.33" x 1.5"). However, we are developing additional sizes that will be available in the coming months. For updates or preorder inquiries, please contact us at info@forcedowels.com.',
    },
    {
      question: "What are Force Dowels made of?",
      answer:
        "Force Dowels are a patent-pending product made from a proprietary composite molded material. This unique design offers enhanced strength and reliability.",
    },
    {
      question: "Are Force Dowels reusable?",
      answer:
        "Force Dowels are designed for single-use applications. However, if a mistake is made during assembly, you may be able to carefully remove the dowel from a leveraged position and reinsert a new dowel with glue.",
    },
    {
      question: "How strong are Force Dowels?",
      answer:
        "Our dowels have been tested to hold 540 lbs before the cabinet's particle board failed. This test was performed on a side-mounted cabinet, where the entire weight was supported vertically by the dowels.",
    },
    {
      question: "What materials are Force Dowels compatible with?",
      answer:
        "Force Dowels have been tested and perform exceptionally well in MDF, particle board, and plywood.",
    },
    {
      question: "What size drill bit do I need?",
      answer:
        'Force Dowels are compatible with a standard 8mm drill bit (approximately 0.315").',
    },
    {
      question: "Do I need any special tools to assemble with Force Dowels?",
      answer:
        "No special tools are required. All you need is a rubber mallet for quick and easy assembly.",
    },
    {
      question: "What is the minimum order quantity?",
      answer:
        "Our standard order quantity is 5,000 dowels, but we also offer a Starter Ship Kit with 300 dowels for $36.00 plus shipping—perfect for small shops or first-time users.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "We offer multiple shipping options via UPS and LTL freight carriers. Delivery times vary based on your chosen carrier and shipping method. Tracking is available on most orders.",
    },
    {
      question: "Do you ship internationally?",
      answer:
        "Yes, we do! International orders can be placed over the phone while we work on integrating international shipping into our website. Please call us at 480-581-7145 for assistance.",
    },
    {
      question: "Can I track my order?",
      answer:
        "Yes. Orders under 20,000 dowels are shipped via UPS and include a tracking number. For larger orders shipped via LTL carriers, tracking may vary, and an estimated delivery timeframe will be provided at checkout.",
    },
    {
      question: "Do you offer bulk or distributor pricing?",
      answer:
        "Yes. Volume pricing is available, and distributor discounts begin on orders larger than 960,000 units. If you're looking to place a high-volume order, please reach out at info@forcedowels.com or 480-581-7145 to discuss custom pricing.",
    },
    {
      question: "Can I order a sample or small test kit?",
      answer:
        "Absolutely. Our Starter Ship Kit includes 300 dowels for $36.00—a great way to try out our product before committing to larger volumes.",
    },
    {
      question: "What if I make a mistake during assembly? Can I fix it?",
      answer:
        "If you're in a leveraged position, you can attempt to remove the dowel by gently rocking the panel side to side. Once removed, apply glue to the predrilled hole and reinsert the proper piece with a new dowel.",
    },
    {
      question: "Are Force Dowels moisture-resistant?",
      answer:
        "Yes. As a composite material, our dowels offer superior moisture resistance compared to traditional wooden dowels.",
    },
    {
      question: "Can Force Dowels be used for outdoor furniture?",
      answer:
      "Yes! While originally designed for cabinetry, Force Dowels are excellent for use in indoor and outdoor furniture, drawer boxes, cabinet construction, and more.",
    },
    {
      question: "Can I become a distributor?",
      answer:
        "Yes. If you're interested in becoming a distributor, you can apply through our website. Distributor pricing becomes available once your order volume reaches 960,000 units.",
    },
  ]

  return (
    <motion.main
      className="flex min-h-[calc(100vh-4rem)] flex-col bg-amber-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container max-w-4xl flex flex-1 px-4 py-12 md:py-16 md:px-6">
        <div className="w-full">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center mb-4">
              <HelpCircle className="h-8 w-8 text-amber-600 mr-3" />
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Frequently Asked Questions
              </h1>
            </div>
            <p className="text-gray-700 md:text-lg max-w-2xl mx-auto">
              Find answers to common questions about Force Dowels, our products, ordering, and shipping.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <AccordionItem 
                    value={`item-${index}`}
                    className="bg-white rounded-lg shadow-sm border border-amber-200 px-6 py-2"
                  >
                    <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-amber-700 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>

          <motion.div
            className="mt-12 text-center bg-white rounded-lg p-8 shadow-sm border border-amber-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-700 mb-6">
              Can't find what you're looking for? Our team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:info@forcedowels.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
              >
                Email Us
              </a>
              <a
                href="tel:480-581-7145"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Call 480-581-7145
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.main>
  )
}
