// components/ui/gradient-card.jsx

import * as React from "react";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

// Define gradient variants for each domain
const cardVariants = cva(
  "relative flex flex-col justify-between h-full w-full overflow-hidden rounded-2xl p-8 shadow-sm transition-shadow duration-300 hover:shadow-lg",
  {
    variants: {
      gradient: {
        orange: "bg-gradient-to-br from-orange-100 to-amber-200/50",
        gray: "bg-gradient-to-br from-slate-100 to-slate-200/50",
        purple: "bg-gradient-to-br from-purple-100 to-indigo-200/50",
        green: "bg-gradient-to-br from-emerald-100 to-teal-200/50",
        red: "bg-gradient-to-br from-red-100 to-rose-200/50",
        blue: "bg-gradient-to-br from-blue-100 to-sky-200/50",
        pink: "bg-gradient-to-br from-pink-100 to-rose-200/50",
        teal: "bg-gradient-to-br from-teal-100 to-cyan-200/50",
        indigo: "bg-gradient-to-br from-indigo-100 to-violet-200/50",
        cyan: "bg-gradient-to-br from-cyan-100 to-sky-200/50",
        slate: "bg-gradient-to-br from-slate-200 to-gray-300/50",
      },
    },
    defaultVariants: {
      gradient: "gray",
    },
  }
);

const GradientCard = React.forwardRef(
  ({ className, gradient, badgeText, badgeColor, title, description, ctaText, ctaHref, imageUrl, ...props }, ref) => {
    
    // Animation variants for framer-motion
    const cardAnimation = {
      rest: { scale: 1, y: 0 },
      hover: { scale: 1.03, y: -4 },
    };

    const imageAnimation = {
      rest: { scale: 1, rotate: 0 },
      hover: { scale: 1.1, rotate: 3 },
    };

    return (
      <motion.div
        variants={cardAnimation}
        initial="rest"
        whileHover="hover"
        animate="rest"
        className="h-full"
        ref={ref}
      >
        <Link
          to={ctaHref}
          className={cn(cardVariants({ gradient }), "no-underline block", className)}
          {...props}
        >
          <div className="flex h-full gap-4">
            {/* Left: Card Content */}
            <div className="z-10 flex flex-col justify-between flex-1 min-w-0">
              {/* Badge */}
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/50 px-3 py-1 text-sm font-medium text-neutral-700 backdrop-blur-sm w-fit">
                  <span 
                    className="h-2 w-2 rounded-full shrink-0" 
                    style={{ backgroundColor: badgeColor }}
                  />
                  {badgeText}
                </div>

                {/* Title and Description */}
                <h3 className="text-2xl font-bold text-black mb-2 tracking-tight">{title}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{description}</p>
              </div>
              
              {/* Call to Action */}
              <span className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-black">
                {ctaText}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>

            {/* Right: Image */}
            <div className="w-[40%] shrink-0 flex items-center justify-center">
              <motion.img
                src={imageUrl}
                alt={`${title} graphic`}
                variants={imageAnimation}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="w-full h-auto max-h-full object-contain rounded-xl pointer-events-none"
              />
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }
);
GradientCard.displayName = "GradientCard";

export { GradientCard, cardVariants };
