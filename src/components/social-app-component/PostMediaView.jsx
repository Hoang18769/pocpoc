import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

const variants = {
  enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
}

const isVideo = (url = "") => /\.(mp4|webm|ogg)$/i.test(url)

export default function PostMediaViewer({ media, index, direction, onPrev, onNext, onTouchStart, onTouchEnd }) {
  const current = media[index]
  if (!current) return null

  return (
    <div className="relative w-full h-full bg-black" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          {isVideo(current) ? (
            <video controls className="w-full h-full object-contain" src={current} />
          ) : (
            <Image src={current} alt={`Post media ${index}`} fill unoptimized className="object-contain" />
          )}
        </motion.div>
      </AnimatePresence>

      {index > 0 && (
        <button className="absolute top-1/2 left-2 -translate-y-1/2 p-1 bg-black/50 text-white rounded-full z-10" onClick={onPrev}>
          <ChevronLeft />
        </button>
      )}
      {index < media.length - 1 && (
        <button className="absolute top-1/2 right-2 -translate-y-1/2 p-1 bg-black/50 text-white rounded-full z-10" onClick={onNext}>
          <ChevronRight />
        </button>
      )}
    </div>
  )
}
