import { useContext } from "react";
import  SidebarContext  from "../layouts/AppLayout";

const PageContainer = ({ children }) => {
  const collapsed = useContext(SidebarContext);

  return (
    <div
      className={`
        w-full mx-auto transition-all duration-300
        ${collapsed ? "max-w-screen-xl" : "max-w-7xl"}
        px-3 sm:px-4 md:px-6
      `}
    >
      {children}
    </div>
  );
};

export default PageContainer;