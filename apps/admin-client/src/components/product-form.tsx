"use client";

import { useState } from "react";
import { Loader2, PackagePlus, Plus, Trash2 } from "lucide-react";
import type { ApiProduct, CreateProductInput } from "@/lib/api";
import { Button } from "@/components/ui/button";

const inputClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";
const labelClass = "text-sm font-medium";

const categories = [
  { value: "pizza", label: "Pizza" },
  { value: "sicilian", label: "Sicilian Pizza" },
  { value: "subs", label: "Subs" },
  { value: "pasta", label: "Pasta" },
  { value: "salads", label: "Salads" },
  { value: "platters", label: "Dinner Platters" },
  { value: "toppings", label: "Toppings" },
];

interface SizeRow {
  label: string;
  price: string;
  [key: string]: string;
}

interface ConfigRow {
  name: string;
  price: string;
  [key: string]: string;
}

interface ProductFormProps {
  initial?: ApiProduct;
  submitLabel: string;
  onSubmit: (input: CreateProductInput) => Promise<void>;
}

function toRupees(cents: number): string {
  return (cents / 100).toFixed(2);
}

function toCents(rupees: string): number {
  return Math.round(parseFloat(rupees) * 100);
}

export default function ProductForm({
  initial,
  submitLabel,
  onSubmit,
}: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "pizza");
  const [price, setPrice] = useState(initial ? toRupees(initial.priceCents) : "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true);
  const [sizes, setSizes] = useState<SizeRow[]>(
    initial?.sizes?.map((s) => ({ label: s.label, price: toRupees(s.priceCents) })) ?? [],
  );
  const [toppings, setToppings] = useState<ConfigRow[]>(
    initial?.toppings?.map((t) => ({ name: t.name, price: toRupees(t.priceCents) })) ?? [],
  );
  const [addOns, setAddOns] = useState<ConfigRow[]>(
    initial?.addOns?.map((a) => ({ name: a.name, price: toRupees(a.priceCents) })) ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateSize = (index: number, field: keyof SizeRow, value: string) =>
    setSizes((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));

  const updateTopping = (index: number, field: keyof ConfigRow, value: string) =>
    setToppings((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));

  const updateAddOn = (index: number, field: keyof ConfigRow, value: string) =>
    setAddOns((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceCents = toCents(price);
    if (isNaN(priceCents) || priceCents < 0) {
      setError("Enter a valid base price");
      return;
    }

    if (
      [...sizes, ...toppings, ...addOns].some(
        (row) => isNaN(toCents(row.price)) || toCents(row.price) < 0,
      )
    ) {
      setError("Enter valid prices for size / topping / add-on rows");
      return;
    }

    const input: CreateProductInput = {
      name,
      priceCents,
      isAvailable,
    };
    if (description.trim()) input.description = description.trim();
    if (category) input.category = category;
    if (imageUrl.trim()) input.imageUrl = imageUrl.trim();

    const sizeRows = sizes
      .filter((row) => row.label.trim())
      .map((row) => ({ label: row.label.trim(), priceCents: toCents(row.price) }));
    const toppingRows = toppings
      .filter((row) => row.name.trim())
      .map((row) => ({ name: row.name.trim(), priceCents: toCents(row.price) }));
    const addOnRows = addOns
      .filter((row) => row.name.trim())
      .map((row) => ({ name: row.name.trim(), priceCents: toCents(row.price) }));

    if (sizeRows.length > 0) input.sizes = sizeRows;
    if (toppingRows.length > 0) input.toppings = toppingRows;
    if (addOnRows.length > 0) input.addOns = addOnRows;

    setIsSubmitting(true);
    try {
      await onSubmit(input);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save product",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-background p-6">
      <div className="space-y-2">
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="e.g. Margherita"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          placeholder="Short description of the product"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`${inputClass} h-auto py-2`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="price" className={labelClass}>
            Base price (₹)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              ₹
            </span>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={`${inputClass} pl-7`}
              required
            />
          </div>
        </div>
      </div>

      <ConfigEditor
        title="Sizes"
        hint="e.g. Small / Large with a price each (optional)"
        rows={sizes}
        onAdd={() => setSizes((prev) => [...prev, { label: "", price: "" }])}
        updateRow={updateSize}
        removeRow={(index) =>
          setSizes((prev) => prev.filter((_, i) => i !== index))
        }
        labelField="label"
        labelPlaceholder="Size (e.g. Small)"
      />

      <ConfigEditor
        title="Toppings"
        hint="Pickable toppings and their price each (optional)"
        rows={toppings}
        onAdd={() => setToppings((prev) => [...prev, { name: "", price: "" }])}
        updateRow={updateTopping}
        removeRow={(index) =>
          setToppings((prev) => prev.filter((_, i) => i !== index))
        }
        labelField="name"
        labelPlaceholder="Topping (e.g. Pepperoni)"
      />

      <ConfigEditor
        title="Add-ons"
        hint="Extra add-ons and their price each (optional)"
        rows={addOns}
        onAdd={() => setAddOns((prev) => [...prev, { name: "", price: "" }])}
        updateRow={updateAddOn}
        removeRow={(index) =>
          setAddOns((prev) => prev.filter((_, i) => i !== index))
        }
        labelField="name"
        labelPlaceholder="Add-on (e.g. Extra Cheese)"
      />

      <div className="space-y-2">
        <label htmlFor="imageUrl" className={labelClass}>
          Image URL
        </label>
        <input
          id="imageUrl"
          type="url"
          placeholder="https://example.com/pizza.png"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
          className="size-4 accent-primary"
        />
        Available to customers
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <PackagePlus className="size-4" />
        )}
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

function ConfigEditor<Row extends { [key: string]: string }>({
  title,
  hint,
  rows,
  onAdd,
  updateRow,
  removeRow,
  labelField,
  labelPlaceholder,
}: {
  title: string;
  hint: string;
  rows: Row[];
  onAdd: () => void;
  updateRow: (index: number, field: keyof Row, value: string) => void;
  removeRow: (index: number) => void;
  labelField: keyof Row;
  labelPlaceholder: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">{title}</span>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
          None
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row, index) => (
            <li key={index} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={labelPlaceholder}
                value={row[labelField]}
                onChange={(e) =>
                  updateRow(index, labelField, e.target.value)
                }
                className={inputClass}
              />
              <div className="relative w-28 shrink-0">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={row.price}
                  onChange={(e) => updateRow(index, "price", e.target.value)}
                  className={`${inputClass} pl-7`}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeRow(index)}
                aria-label={`Remove ${labelField === "label" ? "size" : "row"}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}