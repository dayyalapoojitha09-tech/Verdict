import React, { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const [hovered, setHovered] = useState(false);
  const cursorRef = useRef(null);
  
  // Track actual mouse position
  const mousePos = useRef({ x: -100, y: -100 });
  // Track interpolated cursor position for smooth lag
  const cursorPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.classList.contains("cursor-pointer")
      ) {
        setHovered(true);
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.classList.contains("cursor-pointer")
      ) {
        setHovered(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);

    let animationFrameId;
    const updateCursor = () => {
      if (cursorRef.current) {
        // Linear interpolation (lerp) formula: current + (target - current) * factor
        const dx = mousePos.current.x - cursorPos.current.x;
        const dy = mousePos.current.y - cursorPos.current.y;
        
        cursorPos.current.x += dx * 0.15;
        cursorPos.current.y += dy * 0.15;

        cursorRef.current.style.left = `${cursorPos.current.x}px`;
        cursorRef.current.style.top = `${cursorPos.current.y}px`;
      }
      animationFrameId = requestAnimationFrame(updateCursor);
    };

    animationFrameId = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`custom-cursor hidden md:block ${hovered ? "hovered" : ""}`}
    />
  );
}
