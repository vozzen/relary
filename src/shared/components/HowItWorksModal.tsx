import { useState, useCallback, useEffect, useRef } from 'react'
import type { FC } from 'react'
import './HowItWorksModal.css'

// F0810: "Nasıl Çalışır?" modal dialog with glassy look, opened from Footer link.
export const HowItWorksModal: FC = () => {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const handleOpen = useCallback(() => {
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  // Sync native dialog open state
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  // Close on backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      handleClose()
    }
  }, [handleClose])

  // Close on Escape (native dialog handles this, but sync state)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onCancel = () => setOpen(false)
    dialog.addEventListener('cancel', onCancel)
    return () => dialog.removeEventListener('cancel', onCancel)
  }, [])

  return (
    <>
      <button type="button" className="how-it-works-trigger" onClick={handleOpen}>
        Nasıl Çalışır?
      </button>
      <dialog
        ref={dialogRef}
        className="how-it-works-dialog"
        onClick={handleBackdropClick}
        aria-label="Nasıl Çalışır?"
      >
        <div className="how-it-works-panel">
          <button
            type="button"
            className="how-it-works-close"
            onClick={handleClose}
            aria-label="Kapat"
          >
            ✕
          </button>
          <h2 className="how-it-works-title">Nasıl Çalışır?</h2>
          <div className="how-it-works-body">
            <h3>Maaş Alım Gücü Nedir?</h3>
            <p>Maaş alım gücü, maaşınızın enflasyon ve döviz kurları karşısındaki gerçek değerini gösterir. Nominal maaşınız artsa bile, enflasyon nedeniyle satın alma gücünüz düşebilir.</p>
            <h3>Nasıl Hesaplanır?</h3>
            <p>Girdiğiniz maaş verilerini TCMB EVDS'den alınan güncel enflasyon (TÜFE) ve döviz kuru verileriyle karşılaştırarak maaşınızın reel değerini hesaplarız. Alım gücü serisi, maaşınızın enflasyona göre normalize edilmiş halini gösterir.</p>
            <h3>Veri Kaynağı</h3>
            <p>Enflasyon ve döviz kuru verileri Türkiye Cumhuriyet Merkez Bankası (TCMB) Elektronik Veri Dağıtım Sistemi'nden (EVDS) alınmaktadır.</p>
            <h3>Gizlilik</h3>
            <p>Girdiğiniz maaş verileri yalnızca tarayıcınızda işlenir, hiçbir sunucuya gönderilmez. Verilerinizi tarayıcı yerel deposuna kaydedebilirsiniz.</p>
          </div>
        </div>
      </dialog>
    </>
  )
}
