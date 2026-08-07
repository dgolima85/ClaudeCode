"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
};

export default function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl">
          <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
            <DialogTitle className="text-lg font-semibold text-gray-900">{title}</DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
          <div className="px-5 py-4">{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
