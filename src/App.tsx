import { useState, useRef } from 'react';
import autoTable from 'jspdf-autotable';

import './App.css';
import jsPDF from 'jspdf';

function App() {
  const [total, setTotal] = useState(0);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>('');

  const addressRef = useRef<HTMLInputElement>(null);
  const rentRef = useRef<HTMLInputElement>(null);
  const refAdminFee = useRef<HTMLInputElement>(null);
  const refMediaSettle = useRef<HTMLInputElement>(null);
  const refElectricityAdvance = useRef<HTMLInputElement>(null);
  const refElectricityInvoice = useRef<HTMLInputElement>(null);
  const refTv = useRef<HTMLInputElement>(null);

  const parseToTwoDecimals = (value: string | null | undefined): number => {
    return parseFloat((value || '0').replace(/^(\d*\.?\d{0,2}).*$/, '$1')) || 0;
  };

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const rentValue = parseToTwoDecimals(rentRef.current?.value);
    const adminFee = parseToTwoDecimals(refAdminFee.current?.value);
    const mediaSettle = parseToTwoDecimals(refMediaSettle.current?.value);
    const electricityAdvance = parseToTwoDecimals(
      refElectricityAdvance.current?.value
    );
    const electricityInvoice = parseToTwoDecimals(
      refElectricityInvoice.current?.value
    );
    const tv = parseToTwoDecimals(refTv.current?.value);

    if (
      [
        rentValue,
        adminFee,
        mediaSettle,
        electricityAdvance,
        electricityInvoice,
        tv,
      ].some(value => isNaN(Number(value)) || value < 0)
    ) {
      alert('Please enter valid positive numbers.');
      return;
    }

    const totalValue = [
      rentValue,
      adminFee,
      mediaSettle,
      electricityAdvance,
      electricityInvoice,
      tv,
    ].reduce((acc, value) => acc + Number(value), 0);

    setTotal(totalValue);

    // e.currentTarget.reset();
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${
      currentDate.getMonth() + 1
    }-${currentDate.getFullYear()}`;

    const address = addressRef.current?.value || 'No_address';

    const fileName = `${address}_${formattedDate}_Rent_Calculation.pdf`;

    doc.setFontSize(12);
    doc.setFont('normal');
    doc.text(formattedDate, 200, 10, { align: 'right' });
    doc.text(addressRef.current?.value || 'No address provided', 200, 15, {
      align: 'right',
    });

    doc.setFontSize(16);
    doc.setFont('bold');
    doc.text('Rent Calculation', 105, 30, { align: 'center' });

    const tableData = [
      ['Rent', rentRef.current?.value || '0'],
      ['Administration Fee', refAdminFee.current?.value || '0'],
      [
        'Advance Payment for Electricity',
        refElectricityAdvance.current?.value || '0',
      ],
      ['Electricity Invoice', refElectricityInvoice.current?.value || '0'],
      ['TV/Internet', refTv.current?.value || '0'],
      ['Periodic Media Settlement', refMediaSettle.current?.value || '0'],
    ];

    autoTable(doc, {
      head: [['Category', 'Value']],
      body: tableData,
      startY: 50,
      didDrawCell: data => {
        if (data.row.index === tableData.length - 1) {
          doc.setFontSize(14);
          doc.setFont('extra bold');
          doc.text(
            `Total: ${total} zl`,
            170,
            data.cell.y + data.cell.height + 10,
            {
              align: 'right',
            }
          );
        }
      },
    });

    autoTable(doc, {
      head: [['Category', 'Value']],
      body: tableData,
      startY: 50,
      didDrawCell: data => {
        if (data.row.index === tableData.length - 1) {
          doc.setFontSize(14);
          doc.setFont('bold');
        }
      },
    });
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    setPdfPreviewUrl(pdfUrl);
    setDownloadFileName(fileName);
  };

  return (
    <>
      <h1>Rent Calculator</h1>

      <form onSubmit={submitHandler} className="form">
        <input type="text" placeholder="Address" ref={addressRef} />
        <input type="text" placeholder="Rent" ref={rentRef} />
        <input type="text" placeholder="Administration fee" ref={refAdminFee} />
        <input
          type="text"
          placeholder="Periodic Media Settlement"
          ref={refMediaSettle}
        />
        <input
          type="text"
          placeholder="Advance payment for electricity"
          ref={refElectricityAdvance}
        />
        <input
          type="text"
          placeholder="Electricity Invoice"
          ref={refElectricityInvoice}
        />
        <input type="text" placeholder="TV/Internet" ref={refTv} />

        <button type="submit">Calculate</button>
      </form>

      <h2>Total: {total} zl</h2>
      <div>
        <button onClick={generatePDF} className="pdf-button">
          Generate PDF
        </button>
        {pdfPreviewUrl && (
          <a
            href={pdfPreviewUrl}
            download={downloadFileName}
            className="download-button"
            style={{
              textDecoration: 'none',
              color: 'white',
              backgroundColor: 'green',
              padding: '10px 20px',
              borderRadius: '5px',
              margin: '10px',
              textAlign: 'center',
            }}
          >
            Download PDF
          </a>
        )}
      </div>

      {pdfPreviewUrl && (
        <div style={{ marginTop: '20px' }}>
          <h3>PDF Preview:</h3>
          <iframe
            src={pdfPreviewUrl}
            title="PDF Preview"
            width="1280px"
            height="1200px"
            style={{ border: '1px solid #ccc' }}
          ></iframe>
        </div>
      )}
    </>
  );
}

export default App;
