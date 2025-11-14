import React from 'react';
import { useWindowSize } from '../../hooks/useWindowSize';
import { getItemDescription, getRawMaterialDescription } from '../../utils/quotationFormatter';
import '../../styles/modern-table.css';

const QuotationLinesTable = ({
  quotationLines,
  removedLines,
  showRawPrices,
  showRemovedRaws,
  searchQuery,
  editingLineId,
  editQty,
  editRate,
  items,
  rawMaterials,
  quotationId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onRemoveLine,
  onUndoRemove,
  onDecrementQuantity,
  onEditQtyChange,
  onEditRateChange,
  calculateGrandTotal
}) => {
  const { width } = useWindowSize();
  const isMobile = width <= 768;

  const filteredLines = quotationLines
    .filter(l => !l.isRawMaterial)
    .filter(line => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return line.itemDescription.toLowerCase().includes(query);
    });

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="quotation-lines-mobile">
        {quotationLines.length === 0 ? (
          <div className="no-data-card">
            {quotationId ? 'No items in quotation' : 'Select a quotation'}
          </div>
        ) : (
          <>
            {filteredLines.map((line, index) => {
              const itemRaws = [
                ...quotationLines.filter(raw => raw.isRawMaterial && raw.parentItemId === line.id).map(r => ({...r, _removed:false})),
                ...(showRemovedRaws ? removedLines.filter(raw => raw.isRawMaterial && raw.parentItemId === line.id).map(r => ({...r, _removed:true})) : [])
              ].sort((a,b) => {
                const seqA = a.sequence != null ? a.sequence : (a.id || 0);
                const seqB = b.sequence != null ? b.sequence : (b.id || 0);
                return seqA - seqB;
              });

              return (
                <div key={line.id} className="quotation-line-card">
                  <div className="card-header-row">
                    <span className="card-sr-no" data-label="Sr No">#{index + 1}</span>
                    <div className="card-description" data-label="Description">
                      <strong>{line.itemDescription}</strong>
                      {(() => {
                        const itemDesc = getItemDescription(line, items);
                        return itemDesc ? (
                          <div className="card-description-sub">{itemDesc}</div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  
                  <div className="card-row">
                    <span className="card-label">Qty:</span>
                    <span className="card-value">
                      {editingLineId === line.id ? (
                        <input 
                          type="number" 
                          value={editQty} 
                          onChange={(e) => onEditQtyChange(e.target.value)} 
                          min="1"
                          className="card-input"
                        />
                      ) : (
                        line.quantity
                      )}
                    </span>
                  </div>
                  
                  <div className="card-row">
                    <span className="card-label">Rate / Unit:</span>
                    <span className="card-value">
                      {editingLineId === line.id ? (
                        <input 
                          type="number" 
                          value={editRate} 
                          onChange={(e) => onEditRateChange(e.target.value)} 
                          step="0.01"
                          className="card-input"
                        />
                      ) : (
                        `₹${Number(line.unitPrice).toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  <div className="card-row">
                    <span className="card-label">Total Amount:</span>
                    <span className="card-value card-total">
                      ₹{Number(line.total || (line.quantity * line.unitPrice)).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="card-actions">
                    {editingLineId === line.id ? (
                      <>
                        <button 
                          className="btn btn-xs btn-save" 
                          onClick={() => onSaveEdit(line.id)}
                          aria-label="Save"
                        >
                          <i className="fas fa-check"></i> Save
                        </button>
                        <button 
                          className="btn btn-xs btn-cancel" 
                          onClick={onCancelEdit}
                          aria-label="Cancel"
                        >
                          <i className="fas fa-times"></i> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {line.quantity > 1 && (
                          <button 
                            className="btn btn-xs btn-minus"
                            onClick={() => onDecrementQuantity(line.id)}
                            aria-label="Remove one item"
                          >
                            <i className="fas fa-minus"></i>
                          </button>
                        )}
                        <button 
                          className="btn btn-xs btn-edit" 
                          onClick={() => onStartEdit(line)}
                          aria-label="Edit"
                        >
                          <i className="fas fa-pen"></i>
                        </button>
                        <button 
                          className="btn btn-xs btn-delete"
                          onClick={() => onRemoveLine(line.id)}
                          aria-label="Remove"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Raw Materials as nested cards */}
                  {itemRaws.length > 0 && (
                    <div className="raw-materials-container">
                      {itemRaws.map((raw, rawIndex) => (
                        <div 
                          key={`${raw._removed?'removed-':''}${raw.id}`} 
                          className={`raw-material-card ${raw._removed ? 'raw-removed' : ''}`}
                        >
                          <div className="raw-header">
                            <span className="raw-label">{String.fromCharCode(97 + rawIndex)})</span>
                            <strong className={raw._removed ? 'strikethrough' : ''}>
                              {raw.itemDescription}
                            </strong>
                            {raw._removed && <em className="removed-badge"> (Removed)</em>}
                          </div>
                          {(() => {
                            const rawDesc = getRawMaterialDescription(raw, rawMaterials);
                            return rawDesc ? (
                              <div className="raw-description-sub">{rawDesc}</div>
                            ) : null;
                          })()}
                          
                          <div className="card-row">
                            <span className="card-label">Qty:</span>
                            <span className="card-value">
                              {editingLineId === raw.id && !raw._removed ? (
                                <input 
                                  type="number" 
                                  value={editQty} 
                                  onChange={(e) => onEditQtyChange(e.target.value)} 
                                  min="1"
                                  className="card-input"
                                />
                              ) : (
                                raw._removed ? <s>{raw.quantity}</s> : raw.quantity
                              )}
                            </span>
                          </div>
                          
                          {showRawPrices && (
                            <div className="card-row">
                              <span className="card-label">Rate / Unit:</span>
                              <span className="card-value">
                                {editingLineId === raw.id && !raw._removed ? (
                                  <input 
                                    type="number" 
                                    value={editRate} 
                                    onChange={(e) => onEditRateChange(e.target.value)} 
                                    step="0.01"
                                    className="card-input"
                                  />
                                ) : (
                                  raw._removed ? <s>₹{Number(raw.unitPrice).toFixed(2)}</s> : `₹${Number(raw.unitPrice).toFixed(2)}`
                                )}
                              </span>
                            </div>
                          )}
                          
                          <div className="card-actions">
                            {raw._removed ? (
                              <button 
                                className="btn btn-xs btn-undo" 
                                onClick={() => onUndoRemove(raw.id)}
                                aria-label="Undo"
                              >
                                <i className="fas fa-undo"></i> Undo
                              </button>
                            ) : editingLineId === raw.id ? (
                              <>
                                <button 
                                  className="btn btn-xs btn-save" 
                                  onClick={() => onSaveEdit(raw.id)}
                                  aria-label="Save"
                                >
                                  <i className="fas fa-check"></i> Save
                                </button>
                                <button 
                                  className="btn btn-xs btn-cancel" 
                                  onClick={onCancelEdit}
                                  aria-label="Cancel"
                                >
                                  <i className="fas fa-times"></i> Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                {raw.quantity > 1 && (
                                  <button
                                    className="btn btn-xs btn-minus"
                                    onClick={() => onDecrementQuantity(raw.id)}
                                    aria-label="Remove one raw"
                                  >
                                    <i className="fas fa-minus"></i>
                                  </button>
                                )}
                                <button 
                                  className="btn btn-xs btn-edit" 
                                  onClick={() => onStartEdit(raw)}
                                  aria-label="Edit"
                                >
                                  <i className="fas fa-pen"></i>
                                </button>
                                <button
                                  className="btn btn-xs btn-delete"
                                  onClick={() => onRemoveLine(raw.id)}
                                  aria-label="Remove"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            <div className="grand-total-card">
              <div className="grand-total-label">Grand Total:</div>
              <div className="grand-total-value">
                ₹{calculateGrandTotal().toFixed(2)}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className="table-wrapper">
      <table className="quotation-table modern-table">
        <thead>
          <tr>
            <th>Sr No</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Rate / Unit in ₹</th>
            <th>Total Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotationLines.length === 0 ? (
            <tr>
              <td colSpan="6" className="no-data">
                {quotationId ? 'No items in quotation' : 'Select a quotation'}
              </td>
            </tr>
          ) : (
            <>
              {filteredLines.map((line, index) => {
                const itemRaws = [
                  ...quotationLines.filter(raw => raw.isRawMaterial && raw.parentItemId === line.id).map(r => ({...r, _removed:false})),
                  ...(showRemovedRaws ? removedLines.filter(raw => raw.isRawMaterial && raw.parentItemId === line.id).map(r => ({...r, _removed:true})) : [])
                ].sort((a,b) => {
                  const seqA = a.sequence != null ? a.sequence : (a.id || 0);
                  const seqB = b.sequence != null ? b.sequence : (b.id || 0);
                  return seqA - seqB;
                });

                return (
                  <React.Fragment key={line.id}>
                    <tr>
                      <td data-label="Sr No">{index + 1}</td>
                      <td data-label="Description">
                        <div>
                          <strong>{line.itemDescription}</strong>
                          {(() => {
                            const itemDesc = getItemDescription(line, items);
                            return itemDesc ? (
                              <div style={{ fontSize: '12px', color: '#666', marginTop: 4, fontStyle: 'normal' }}>
                                {itemDesc}
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </td>
                      <td data-label="Qty">
                        {editingLineId === line.id ? (
                          <input type="number" value={editQty} onChange={(e) => onEditQtyChange(e.target.value)} min="1" />
                        ) : (
                          line.quantity
                        )}
                      </td>
                      <td data-label="Rate / Unit in ₹">
                        {editingLineId === line.id ? (
                          <input type="number" value={editRate} onChange={(e) => onEditRateChange(e.target.value)} step="0.01" />
                        ) : (
                          `₹${Number(line.unitPrice).toFixed(2)}`
                        )}
                      </td>
                      <td data-label="Total Amount">₹{Number(line.total || (line.quantity * line.unitPrice)).toFixed(2)}</td>
                      <td data-label="Actions">
                        {editingLineId === line.id ? (
                          <div className="row-actions">
                            <button className="btn btn-xs btn-save" onClick={() => onSaveEdit(line.id)} title="Save" aria-label="Save"><i className="fas fa-check"></i></button>
                            <button className="btn btn-xs btn-cancel" onClick={onCancelEdit} title="Cancel" aria-label="Cancel"><i className="fas fa-times"></i></button>
                          </div>
                        ) : (
                          <div className="row-actions">
                            {line.quantity > 1 && (
                              <button 
                                className="btn btn-xs btn-minus"
                                onClick={() => onDecrementQuantity(line.id)}
                                title="Remove one item"
                                aria-label="Remove one item"
                              >
                                <i className="fas fa-minus"></i>
                              </button>
                            )}
                            <button className="btn btn-xs btn-edit" onClick={() => onStartEdit(line)} title="Edit" aria-label="Edit"><i className="fas fa-pen"></i></button>
                            <button 
                              className="btn btn-xs btn-delete"
                              onClick={() => onRemoveLine(line.id)}
                              title="Remove"
                              aria-label="Remove"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {itemRaws.map((raw, rawIndex) => (
                      <tr key={`${raw._removed?'removed-':''}${raw.id}`} className={raw._removed ? 'row-removed' : ''}>
                        <td data-label="Sr No"></td>
                        <td data-label="Description" style={{ paddingLeft: 24 }}>
                          <div>
                            <strong>{String.fromCharCode(97 + rawIndex)}) {raw._removed ? <><s>{raw.itemDescription}</s></> : raw.itemDescription}</strong>
                            {raw._removed && <em> (Removed)</em>}
                            {(() => {
                              const rawDesc = getRawMaterialDescription(raw, rawMaterials);
                              return rawDesc ? (
                                <div style={{ fontSize: '12px', color: '#666', marginTop: 4, fontStyle: 'normal' }}>
                                  {rawDesc}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </td>
                        <td data-label="Qty">
                          {editingLineId === raw.id && !raw._removed ? (
                            <input type="number" value={editQty} onChange={(e) => onEditQtyChange(e.target.value)} min="1" />
                          ) : (
                            raw._removed ? <s>{raw.quantity}</s> : raw.quantity
                          )}
                        </td>
                        <td data-label="Rate / Unit in ₹">
                          {showRawPrices ? (
                            editingLineId === raw.id && !raw._removed ? (
                              <input type="number" value={editRate} onChange={(e) => onEditRateChange(e.target.value)} step="0.01" />
                            ) : (
                              raw._removed ? <s>₹{Number(raw.unitPrice).toFixed(2)}</s> : `₹${Number(raw.unitPrice).toFixed(2)}`
                            )
                          ) : '—'}
                        </td>
                        <td data-label="Total Amount">—</td>
                        <td data-label="Actions">
                          {raw._removed ? (
                            <div className="row-actions">
                              <button className="btn btn-xs btn-undo" onClick={() => onUndoRemove(raw.id)} title="Undo" aria-label="Undo"><i className="fas fa-undo"></i></button>
                            </div>
                          ) : editingLineId === raw.id ? (
                            <div className="row-actions">
                              <button className="btn btn-xs btn-save" onClick={() => onSaveEdit(raw.id)} title="Save" aria-label="Save"><i className="fas fa-check"></i></button>
                              <button className="btn btn-xs btn-cancel" onClick={onCancelEdit} title="Cancel" aria-label="Cancel"><i className="fas fa-times"></i></button>
                            </div>
                          ) : (
                            <div className="row-actions">
                              {raw.quantity > 1 && (
                                <button
                                  className="btn btn-xs btn-minus"
                                  onClick={() => onDecrementQuantity(raw.id)}
                                  title="Remove one raw"
                                  aria-label="Remove one raw"
                                >
                                  <i className="fas fa-minus"></i>
                                </button>
                              )}
                              <button className="btn btn-xs btn-edit" onClick={() => onStartEdit(raw)} title="Edit" aria-label="Edit"><i className="fas fa-pen"></i></button>
                              <button
                                className="btn btn-xs btn-delete"
                                onClick={() => onRemoveLine(raw.id)}
                                title="Remove"
                                aria-label="Remove"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </>
          )}
          <tr className="grand-total-row">
            <td colSpan="4" className="grand-total-label">
              <strong>Grand Total</strong>
            </td>
            <td className="grand-total-value">
              <strong>₹{calculateGrandTotal().toFixed(2)}</strong>
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default QuotationLinesTable;

