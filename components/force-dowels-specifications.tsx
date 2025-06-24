"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function ForceDownelsSpecifications() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="py-8"></div>
  }

  const specifications = [
    { property: "Material", value: "High-Grade Steel" },
    { property: "Diameter", value: "8mm" },
    { property: "Length", value: "35mm" },
    { property: "Finish", value: "Zinc Plated" },
    { property: "Tensile Strength", value: "1,200 lbs" },
    { property: "Compatibility", value: "Most 8mm Dowel Systems" },
    { property: "Installation", value: "No Glue Required" },
    { property: "Exterior Fasteners", value: "None Required" },
  ]

  return (
    <section className="py-12 bg-gray-50">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Force Dowels™ Specifications
                </CardTitle>
                <p className="text-amber-600 font-medium">Patent Pending Technology</p>
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="max-w-2xl mx-auto"
              >
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="border-amber-200">
                      <TableHead className="text-center font-semibold text-gray-700 bg-amber-50">
                        Specification
                      </TableHead>
                      <TableHead className="text-center font-semibold text-gray-700 bg-amber-50">
                        Value
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specifications.map((spec, index) => (
                      <motion.tr
                        key={spec.property}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className="border-gray-200 hover:bg-amber-25 transition-colors duration-200"
                      >
                        <TableCell className="text-center font-medium text-gray-800 py-3">
                          {spec.property}
                        </TableCell>
                        <TableCell className="text-center text-gray-700 py-3">
                          {spec.value}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
