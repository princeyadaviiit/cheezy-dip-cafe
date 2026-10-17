"use client";

import React, { useState } from "react";
import Image from "next/image";
import { type MenuItem } from "@/lib/menu-data";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";

interface ItemModifierModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, selectedOptions: string[], note?: string) => void;
}

function ItemModifierContent({
  item,
  onAddToCart,
  onClose,
}: {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number, selectedOptions: string[], note?: string) => void;
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    if (item.options) {
      for (const group of item.options) {
        if (group.choices.length > 0) {
          defaults[group.name] = group.choices[0].label;
        }
      }
    }
    return defaults;
  });

  // Calculate current total
  let optionsDeltaMinor = 0;
  if (item.options) {
    for (const group of item.options) {
      const selectedLabel = selectedChoices[group.name];
      if (selectedLabel) {
        const choice = group.choices.find((c) => c.label === selectedLabel);
        if (choice) {
          optionsDeltaMinor += choice.priceDeltaMinor;
        }
      }
    }
  }

  const unitTotalMinor = item.priceMinor + optionsDeltaMinor;
  const grandTotalMinor = unitTotalMinor * quantity;

  const handleToggleOption = (groupName: string, choiceLabel: string) => {
    setSelectedChoices((prev) => ({
      ...prev,
      [groupName]: choiceLabel,
    }));
  };

  const handleAdd = () => {
    const selectedArray = Object.values(selectedChoices).filter(Boolean);
    onAddToCart(item, quantity, selectedArray, note.trim() || undefined);
    onClose();
  };

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto pb-4">
      {/* Item Image */}
      {item.imagePath && (
        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-neutral-900 border border-[var(--border)]">
          <Image
            src={item.imagePath}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 400px"
          />
          {item.diet === "veg" && (
            <span className="absolute top-2.5 left-2.5 bg-neutral-900/90 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              100% PURE VEG
            </span>
          )}
        </div>
      )}

      {/* Description & Base Price */}
      <div>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          {item.description}
        </p>
        <p className="mt-1.5 text-base font-bold text-[var(--accent)]">
          ₹{Math.round(item.priceMinor / 100)}
        </p>
      </div>

      {/* Option Groups */}
      {item.options &&
        item.options.map((group) => (
          <div key={group.name} className="p-3.5 rounded-xl bg-neutral-900/60 border border-[var(--border)]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-white">
                {group.name}
              </h4>
              <span className="text-[11px] text-[var(--muted)]">
                Select option
              </span>
            </div>
            <div className="space-y-2">
              {group.choices.map((choice) => {
                const isSelected = selectedChoices[group.name] === choice.label;
                return (
                  <button
                    key={choice.label}
                    type="button"
                    onClick={() => handleToggleOption(group.name, choice.label)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-colors min-h-[44px] ${
                      isSelected
                        ? "bg-[var(--accent)]/10 border-[var(--accent)] text-white"
                        : "bg-neutral-800/40 border-[var(--border)] text-neutral-300 hover:bg-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-[var(--accent)] bg-[var(--accent)]"
                            : "border-neutral-500"
                        }`}
                      >
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-black font-bold" />
                        )}
                      </span>
                      <span className="text-sm">{choice.label}</span>
                    </div>
                    {choice.priceDeltaMinor > 0 && (
                      <span className="text-xs font-semibold text-[var(--accent)]">
                        +₹{Math.round(choice.priceDeltaMinor / 100)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

      {/* Special Instructions Note */}
      <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-[var(--border)]">
        <label
          htmlFor="special-instructions"
          className="block text-xs font-semibold text-neutral-300 mb-1.5"
        >
          Special instructions for kitchen (optional)
        </label>
        <input
          id="special-instructions"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Less spicy, extra crispy, sauce on side"
          maxLength={150}
          className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-800 border border-[var(--border)] text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--accent)] min-h-[44px]"
        />
      </div>

      {/* Quantity and Add to Cart Action */}
      <div className="pt-2 flex items-center gap-3">
        {/* Quantity stepper */}
        <div className="flex items-center border border-[var(--border)] rounded-xl bg-neutral-900 overflow-hidden h-12">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="w-11 h-12 flex items-center justify-center text-lg font-bold text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-8 text-center text-sm font-bold text-white">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(20, q + 1))}
            disabled={quantity >= 20}
            className="w-11 h-12 flex items-center justify-center text-lg font-bold text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Add Button */}
        <Button
          type="button"
          variant="primary"
          onClick={handleAdd}
          className="flex-1 h-12 font-bold text-base flex items-center justify-between px-5"
        >
          <span>Add to Order</span>
          <span>₹{Math.round(grandTotalMinor / 100)}</span>
        </Button>
      </div>
    </div>
  );
}

export function ItemModifierModal({
  item,
  isOpen,
  onClose,
  onAddToCart,
}: ItemModifierModalProps) {
  if (!item) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={item.name}>
      <ItemModifierContent
        key={item.id}
        item={item}
        onAddToCart={onAddToCart}
        onClose={onClose}
      />
    </BottomSheet>
  );
}
