/** Full photograph, scaled to fit — never cropped, never taller than the sheet. */
export function StudioFitPreview({ src }: { src: string }) {
  return (
    <div className="flex max-h-[min(52dvh,28rem)] w-full items-center justify-center overflow-hidden border border-studio-border/70 bg-studio-bg">
      <img src={src} alt="" className="max-h-[min(52dvh,28rem)] max-w-full object-contain" />
    </div>
  )
}
