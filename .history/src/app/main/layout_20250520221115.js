import SidebarNavigation from "@/components/ui-components/SidebarNavigation"

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <div className="flex">
        <SidebarNavigation />
        <main className="flex-1 p-4 md:p-6 lg:p-8 mt-0 md:mt-[64px]">{children}</main>
      </div>
    </div>
  )
}
