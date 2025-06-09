
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";

export function SidebarLoadingState() {
  return (
    <Sidebar className="bg-black border-gray-800">
      <SidebarContent className="bg-black">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
