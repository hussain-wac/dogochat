import * as React from "react"
import { cn } from "@/lib/utils"
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels"

const ResizablePanelGroup = React.forwardRef(
  ({ className, ...props }, ref) => (
    <PanelGroup 
      ref={ref} 
      className={cn("flex", className)} 
      {...props} 
    />
  )
)
ResizablePanelGroup.displayName = "ResizablePanelGroup"

const ResizablePanel = React.forwardRef(
  ({ className, ...props }, ref) => (
    <Panel 
      ref={ref} 
      className={cn("", className)} 
      {...props} 
    />
  )
)
ResizablePanel.displayName = "ResizablePanel"

const ResizablePanelHandle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <PanelResizeHandle 
      ref={ref} 
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 hover:bg-accent hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
        className
      )} 
      {...props} 
    />
  )
)
ResizablePanelHandle.displayName = "ResizablePanelHandle"

export { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizablePanelHandle 
}