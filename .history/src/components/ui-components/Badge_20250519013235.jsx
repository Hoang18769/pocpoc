
export default function Badge({ count = 0 }) {
  if (count === 0) return null;

  return (
    <Badge
      className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none px-1.5 py-[2px] rounded-full shadow-md z-10"
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
