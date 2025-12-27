import React from "react";

interface Props {
  formData: any;
  customers: any[];
  onChange: (e: any) => void;
  onItemChange: (i: number, field: string, value: any) => void;
  addItem: () => void;
  removeItem: (i: number) => void;
  calculateTotals: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
}

const InvoiceForm: React.FC<Props> = ({
  formData,
  customers,
  onChange,
  onItemChange,
  addItem,
  removeItem,
  calculateTotals,
  onSubmit,
  submitText,
}) => {
  return (
    <form className="customer-form" onSubmit={onSubmit}>
      {/* Customer Selector */}
      <div className="form-group">
        <label>Select Customer</label>
        <select
          name="customerName"
          value={formData.customerName}
          onChange={onChange}
        >
          <option value="">-- Select Customer --</option>
          {customers.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Vechile Number</label>
        <input
          type="text"
          name="vechileNumber"
          value={formData.vechileNumber}
          onChange={onChange}
        />
      </div>

      {/* GST Yes/No */}
      <div className="form-group">
        <label>Apply GST?</label>
        <select
          name="isGST"
          value={formData.isGST ? "yes" : "no"}
          onChange={onChange}
        >
          <option value="yes">Yes (With GST)</option>
          <option value="no">No (Without GST)</option>
        </select>
      </div>

      <hr />

      {/* Line Items */}
      <h3>Invoice Items</h3>

      {formData.items.map((item: any, index: number) => (
        <div key={index} className="invoice-item-row">
          <input
            type="text"
            placeholder="Description"
            value={item.description}
            onChange={(e) => onItemChange(index, "description", e.target.value)}
          />
          <input
            type="number"
            placeholder="Qty"
            value={item.quantity}
            onChange={(e) =>
              onItemChange(index, "quantity", Number(e.target.value))
            }
          />
          <input
            type="number"
            placeholder="Price"
            value={item.price}
            onChange={(e) =>
              onItemChange(index, "price", Number(e.target.value))
            }
          />
          <span className="item-total">₹ {item.total.toFixed(2)}</span>

          {index > 0 && (
            <button
              type="button"
              className="delete-btn"
              onClick={() => removeItem(index)}
            >
              X
            </button>
          )}
        </div>
      ))}

      <button type="button" className="add-btn" onClick={addItem}>
        + Add Item
      </button>

      <hr />

      {/* Totals */}
      <div className="totals-section">
        <p>Subtotal: ₹ {formData.subtotal.toFixed(2)}</p>
        <h3>Total: ₹ {formData.finalTotal.toFixed(2)}</h3>
      </div>

      <button type="button" className="calculate-btn" onClick={calculateTotals}>
        Calculate
      </button>

      {/* Payment Status */}
      <div className="form-group">
        <label>Payment Status</label>
        <select
          name="paymentStatus"
          value={formData.paymentStatus}
          onChange={onChange}
        >
          <option value="paid">Paid</option>
          <option value="unpaid">Not Paid</option>
        </select>
      </div>

      <button type="submit" className="submit-btn">
        {submitText}
      </button>
    </form>
  );
};

export default InvoiceForm;
