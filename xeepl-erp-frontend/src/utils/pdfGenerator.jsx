import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';
import { getItemDescription, getRawMaterialDescription } from './quotationFormatter';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    position: 'relative',
    backgroundColor: '#ffffff',
    paddingBottom: 60
  },
  header: {
    marginBottom: 16,
    borderBottom: '2 solid #1f8a4c',
    paddingBottom: 8
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f8a4c',
    marginBottom: 6
  },
  subtitle: {
    fontSize: 11,
    color: '#666',
    marginBottom: 5
  },
  section: {
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1f8a4c',
    marginBottom: 6,
    textDecoration: 'underline'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5
  },
  label: {
    width: '28%',
    fontWeight: 'bold',
    color: '#333'
  },
  value: {
    width: '72%',
    color: '#666'
  },
  table: {
    marginTop: 12
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1f8a4c',
    color: 'white',
    padding: 8,
    fontWeight: 'bold',
    position: 'relative',
    overflow: 'hidden'
  },
  tableHeaderPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
    backgroundColor: '#1a6b3d'
  },
  tableHeaderStripe: {
    position: 'absolute',
    width: '200%',
    height: 2,
    backgroundColor: '#1a6b3d',
    opacity: 0.3,
    transform: 'rotate(45deg)'
  },
  tableHeaderText: {
    position: 'relative',
    zIndex: 1
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e0e0e0',
    padding: 8,
    backgroundColor: '#fff'
  },
  tableRowRaw: {
    flexDirection: 'row',
    borderBottom: '1 solid #f0f0f0',
    padding: 8,
    backgroundColor: '#f9f9f9',
    paddingLeft: 20
  },
  tableRowRemoved: {
    backgroundColor: '#fff9e6',
    opacity: 0.8
  },
  removedText: {
    textDecoration: 'line-through',
    color: '#999'
  },
  col1: { width: '10%' },
  col2: { width: '45%' },
  col3: { width: '15%' },
  col4: { width: '15%' },
  col5: { width: '15%', textAlign: 'right' },
  itemName: {
    fontWeight: 'bold',
    color: '#333'
  },
  rawName: {
    fontWeight: 'bold',
    color: '#333'
  },
  rawDescription: {
    color: '#666',
    fontSize: 9,
    marginTop: 2
  },
  itemDescription: {
    color: '#666',
    fontSize: 9,
    marginTop: 2
  },
  grandTotalRow: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e9',
    padding: 10,
    marginTop: 10,
    fontWeight: 'bold'
  },
  grandTotalLabel: {
    width: '85%',
    textAlign: 'right',
    fontSize: 13,
    color: '#1f8a4c'
  },
  grandTotalValue: {
    width: '15%',
    textAlign: 'right',
    fontSize: 13,
    color: '#1f8a4c'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#999',
    fontSize: 8,
    borderTop: '1 solid #e0e0e0',
    paddingTop: 10
  }
});

export const generateQuotationPDF = async (quotation, quotationLines, options = { showRawPrices: true, items: [], rawMaterials: [] }) => {
  const { showRawPrices, items: allItems = [], rawMaterials = [] } = options;

  // Ensure ordering: items then children raws (a,b,...) by id asc
  // Include removed raws if they exist in the quotationLines array
  const quotationItems = (quotationLines || []).filter(l => !l.isRawMaterial && !l.removed);
  const raws = (quotationLines || []).filter(l => l.isRawMaterial);
  const orderedLines = [];
  quotationItems.forEach(item => {
    orderedLines.push(item);
    raws
      .filter(r => r.parentItemId === item.id)
      .sort((a, b) => a.id - b.id)
      .forEach(r => orderedLines.push(r));
  });
  // Helper function to format currency with proper rupee symbol
  const formatCurrency = (amount) => {
    // Use "Rs." instead of ₹ symbol for better PDF compatibility
    return `Rs. ${Number(amount).toFixed(2)}`;
  };

  const MyDocument = (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>QUOTATION</Text>
          <Text style={styles.subtitle}>Quotation ID: #{quotation.id}</Text>
        </View>

        {/* Quotation Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quotation Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{quotation.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{quotation.date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Expiry Date:</Text>
            <Text style={styles.value}>{quotation.expiryDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{quotation.status}</Text>
          </View>
        </View>

        {/* Customer Details */}
        {quotation.customer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{quotation.customer.fullName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{quotation.customer.email}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Mobile:</Text>
              <Text style={styles.value}>{quotation.customer.mobile}</Text>
            </View>
          </View>
        )}

        {/* Quotation Lines Table */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Quotation Lines</Text>
          
          {/* Table Header */}
          <View style={styles.tableHeader}>
            {/* Diagonal stripe pattern overlay */}
            {Array.from({ length: 20 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.tableHeaderStripe,
                  {
                    top: i * 8 - 100,
                    left: -50
                  }
                ]}
              />
            ))}
            <Text style={[styles.col1, styles.tableHeaderText]}>Sr No</Text>
            <Text style={[styles.col2, styles.tableHeaderText]}>Description</Text>
            <Text style={[styles.col3, styles.tableHeaderText]}>Qty</Text>
            <Text style={[styles.col4, styles.tableHeaderText]}>Rate (Rs.)</Text>
            <Text style={[styles.col5, styles.tableHeaderText]}>Total (Rs.)</Text>
          </View>

          {/* Table Rows */}
          {quotationItems.map((line, index) => {
              // Get all raws for this item (including removed) sorted by ID
              const itemRaws = orderedLines
                .filter(raw => raw.isRawMaterial && raw.parentItemId === line.id)
                .sort((a, b) => a.id - b.id);
              
              return (
                <View key={line.id}>
                  {/* Main Item Row */}
                  <View style={styles.tableRow}>
                    <Text style={styles.col1}>{index + 1}</Text>
                    <View style={styles.col2}>
                      <Text style={styles.itemName}>
                        {line.itemDescription}
                      </Text>
                      {(() => {
                        const itemDesc = getItemDescription(line, allItems);
                        return itemDesc ? (
                          <Text style={styles.itemDescription}>
                            {itemDesc}
                          </Text>
                        ) : null;
                      })()}
                    </View>
                    <Text style={styles.col3}>{line.quantity}</Text>
                    <Text style={styles.col4}>{formatCurrency(line.unitPrice)}</Text>
                    <Text style={styles.col5}>{formatCurrency(line.total)}</Text>
                  </View>

                  {/* Raw Material Rows */}
                  {itemRaws.map((raw, rawIndex) => {
                    const rawDesc = getRawMaterialDescription(raw, rawMaterials);
                    return (
                      <View key={raw.id} style={[styles.tableRowRaw, raw.removed ? styles.tableRowRemoved : null]}>
                        <Text style={styles.col1}>
                          {String.fromCharCode(97 + rawIndex)})
                        </Text>
                        <View style={styles.col2}>
                          <Text style={[styles.rawName, raw.removed ? styles.removedText : null]}>
                            {raw.removed ? `${raw.itemDescription} (Removed)` : raw.itemDescription}
                          </Text>
                          {rawDesc ? (
                            <Text style={[styles.rawDescription, raw.removed ? styles.removedText : null]}>
                              {rawDesc}
                            </Text>
                          ) : null}
                        </View>
                        <Text style={[styles.col3, raw.removed ? styles.removedText : null]}>{raw.quantity}</Text>
                        <Text style={[styles.col4, raw.removed ? styles.removedText : null]}>
                          {showRawPrices ? formatCurrency(raw.unitPrice) : '—'}
                        </Text>
                        <Text style={styles.col5}>—</Text>
                      </View>
                    );
                  })}
                </View>
              );
            })
          }

          {/* Grand Total */}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total:</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(
                quotationLines
                  .filter(line => !line.isRawMaterial)
                  .reduce((sum, line) => sum + Number(line.total), 0)
              )}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>© {new Date().getFullYear()} XEEPL ERP. All rights reserved.</Text>
          <Text>Generated on {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );

  const blob = await pdf(MyDocument).toBlob();
  return blob;
};

export const downloadQuotationPDF = async (quotation, quotationLines, options = { showRawPrices: true, items: [], rawMaterials: [] }) => {
  try {
    const blob = await generateQuotationPDF(quotation, quotationLines, options);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quotation_${quotation.id}_${quotation.name.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  }
};
