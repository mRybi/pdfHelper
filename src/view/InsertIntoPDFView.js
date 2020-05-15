import React, { useState, useEffect } from "react";
import ramka from "../ramka.png";
import * as moment from "moment";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import { FileDisplay } from "../components/FileDisplay/FileDisplay";

function InsertIntoPDFView() {
  const [fileContent, setFileContent] = useState("");
  // const [fileContent, setFileContent] = useState([]); //multi pdf laczenie

  const [date, setDate] = useState(new Date());
  const [number, setNumber] = useState("P.1425.2020.");
    const [scale, setScale] = useState(0.7);
    const [showFile, setShowFile] = useState(false);


  const [x, setX] = useState(20);
  const [y, setY] = useState(20);

  const [bytes, setBytes] = useState(null);

  const [pdfBytes, setpdfBytes] = useState(null);

  const [ramkaBytes, setRamkaBytes] = useState(null);

  useEffect(() => {
    prepareRamka();
  }, [number, date]);

  let fileReader;

  const handleFileRead = (e) => {
    const content = fileReader.result;
    console.log(content);
    setFileContent(content);
  };

  const handleChange = (content) => {
    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsArrayBuffer(content);
    console.log(fileReader, fileReader.result, fileContent);
  };

  const prepareRamka = async () => {
    const pngImageBytes = await fetch(ramka).then((res) => res.arrayBuffer());

    const imgpdf = await PDFDocument.create();
    const pngImage = await imgpdf.embedPng(pngImageBytes);
    imgpdf.addPage([pngImage.width, pngImage.height]);

    const pngDims = pngImage.scale(1); // wielkosc ramki
    const helveticaFont = await imgpdf.embedFont(StandardFonts.HelveticaBold);

    const pages = imgpdf.getPages();
    const firstPage = pages[0];

    firstPage.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: pngDims.width,
      height: pngDims.height,
    });

    // data
    firstPage.drawText(date.toLocaleDateString(), {
      x: 200,
      y: 100,
      size: 10,
      font: helveticaFont,
      color: rgb(0.95, 0.1, 0.1),
    });

    //numerek
    firstPage.drawText(number, {
      x: 200,
      y: 125,
      size: 12,
      font: helveticaFont,
      color: rgb(0.95, 0.1, 0.1),
    });

    let ramkaBytes = await imgpdf.save();
    setRamkaBytes(ramkaBytes);
    return imgpdf;
  };
  async function modifyPdf() {
    let imgpdf = await prepareRamka();

    const pdfDocContent = await PDFDocument.load(fileContent);

    const pdfDoc = await PDFDocument.create();

    let [ramkapage] = await pdfDoc.copyPages(imgpdf, [0]);
    let [contentPage] = await pdfDoc.copyPages(pdfDocContent, [0]);

    let embeddedPageRamka = await pdfDoc.embedPage(ramkapage);
    let embeddedPageContent = await pdfDoc.embedPage(contentPage);

    const embeddedPageRamkaDims = embeddedPageRamka.scale(scale);
    const embeddedPageContentDims = embeddedPageContent.scale(1);

    const page = pdfDoc.addPage([
      embeddedPageContentDims.width,
      embeddedPageContentDims.height,
    ]);
    page.drawPage(embeddedPageRamka, {
      ...embeddedPageRamkaDims,
      x: page.getWidth() - embeddedPageRamkaDims.width - x,
      y: page.getHeight() - embeddedPageRamkaDims.height - y,
    });

    page.drawPage(embeddedPageContent, {
      ...embeddedPageContentDims,
      x: 0,
      y: 0,
    });

    const pdfBytes = await pdfDoc.save();
    setBytes(pdfBytes);
    setpdfBytes(pdfBytes);
    setShowFile(true);
  }

  const handleDateChange = (value) => {
    let newDate = new Date(value);
    setDate(newDate);
  };

  return (
    <div className="App">
      <header className="App-header">
        {fileContent && (
          <button type="submit" onClick={async () => await modifyPdf()}>
            RUN
          </button>
        )}

        <div className="row">
          <div className="column">
            <div>
              <label>plik pdf: </label>
              <input
                type="file"
                onChange={(event) => handleChange(event.target.files[0])}
                accept=".pdf"
                multiple={true}
              ></input>
            </div>

            <div>
              <label>skala czerownej ramki: </label>
              <input
                type="number"
                defaultValue={scale}
                onChange={(event) => setScale(Number(event.target.value))}
              />
            </div>
            <div>
              <label>x: </label>
              <input
                type="number"
                defaultValue={x}
                onChange={async (event) => setX(Number(event.target.value))}
              />
            </div>
            <div>
              <label>y: </label>
              <input
                type="number"
                defaultValue={y}
                onChange={(event) => setY(Number(event.target.value))}
              />
            </div>
          </div>
          <div className="column">
            <div>
              <label>numer roboty: </label>
              <input
                type="text"
                defaultValue={number}
                onChange={(event) => setNumber(event.target.value)}
              />
            </div>

            <div>
              <label>data: </label>
              <input
                type="date"
                defaultValue={moment(date).format("YYYY-MM-DD")}
                onChange={(event) => {
                  handleDateChange(event.target.value.toString());
                }}
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="column-input">
            {pdfBytes && <FileDisplay bytes={pdfBytes} />}
          </div>
          <div className="column-input">
            <FileDisplay bytes={ramkaBytes} />
          </div>
        </div>
      </header>
    </div>
  );
}

export default InsertIntoPDFView;
