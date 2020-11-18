import React, { useState, useEffect, useLayoutEffect } from "react";
import ramka from "../ramka.png";
import ramkaTarcza from "../tarcza4.png";
import ramkaTarczaZMiastem from "../ramkaV5.png";


import * as moment from "moment";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

import { FileDisplay } from "../components/FileDisplay/FileDisplay";

function InsertIntoPDFView() {
  const [isTarczaView, setTarczView] = useState(true);
  const [fileContent, setFileContent] = useState("");

  const [organProwadzacy, setOrganProwadzacy] = useState(false);

  const [date, setDate] = useState(new Date());
  const [dateSporządzenia, setDateSporządzenia] = useState(new Date());

  const [numberTarcza, setNumberTarcza] = useState("Gd.III.6642.2.1"); // GKN-I.
  const [number, setNumber] = useState("Gd.III.6642.2.2"); // P.1425.2020.

  const [scale, setScale] = useState(0.5);
  const [showFile, setShowFile] = useState(false);

  const [x, setX] = useState(20);
  const [y, setY] = useState(20);

  const [bytes, setBytes] = useState(null);

  const [pdfBytes, setpdfBytes] = useState(null);

  const [ramkaBytes, setRamkaBytes] = useState(null);
  const [deegrees, setDeegrees] = useState(0);


  useEffect(() => {
    isTarczaView ? prepareRamkaTarcza4() : prepareRamka();
    fileContent && modifyPdf();
  }, [number,numberTarcza, date, dateSporządzenia, deegrees, isTarczaView, organProwadzacy]);

  useEffect(() => {
    fileContent && modifyPdf();
  }, [x, y, scale]);

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

    firstPage.setRotation(degrees(deegrees))


    let ramkaBytes = await imgpdf.save();
    setRamkaBytes(ramkaBytes);
    return imgpdf;
  };

  const prepareRamkaTarcza4 = async () => {
    const pngImageBytes = await fetch(ramkaTarczaZMiastem).then((res) => res.arrayBuffer());

    const imgpdf = await PDFDocument.create();
    const pngImage = await imgpdf.embedPng(pngImageBytes);
    imgpdf.addPage([pngImage.width, pngImage.height]);

    const pngDims = pngImage.scale(1); // wielkosc ramki
    const helveticaFont = await imgpdf.embedFont(StandardFonts.Helvetica);

    const pages = imgpdf.getPages();
    const firstPage = pages[0];

    firstPage.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: pngDims.width,
      height: pngDims.height,
    });

    // organ prowadzacy oanstwowy zasob
    firstPage.drawText(`${organProwadzacy ? 'STAROSTA RADOMSKI' : 'PREZYDENT MIASTA RADOMIA'}`, {
      x: organProwadzacy ? 310 : 270,
      y: 290,
      size: 16,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // indetyfikator zgłoszenia prac geodezyjnych
    firstPage.drawText(numberTarcza, {
      x: 305,
      y: 250,
      size: 16,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // numer i data sporzadzenia dokumentu potwierdzajacego...
    firstPage.drawText(number, {
      x: 305,
      y: 140,
      size: 16,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    firstPage.drawText(`z dn. ${dateSporządzenia.toLocaleDateString()}`, {
      x: 330,
      y: 120,
      size: 16,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2),
    });


    // data przy podpisie
    firstPage.drawText(`Radom, dnia ${dateSporządzenia.toLocaleDateString()}r.`, {
      x: 385,
      y: 10,
      size: 12,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2),
    });



    firstPage.setRotation(degrees(deegrees))


    let ramkaBytes = await imgpdf.save();
    setRamkaBytes(ramkaBytes);
    return imgpdf;
  };

  async function modifyPdf() {
    let imgpdf = isTarczaView ? await prepareRamkaTarcza4() : await prepareRamka();

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

    page.drawPage(embeddedPageContent, {
      ...embeddedPageContentDims,
      x: 0,
      y: 0,
    });

    page.drawPage(embeddedPageRamka, {
      ...embeddedPageRamkaDims,
      x: page.getWidth() - embeddedPageRamkaDims.width - x,
      y: page.getHeight() - embeddedPageRamkaDims.height - y,
      rotate: degrees(-deegrees)
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

  const handleDateSporządzeniaChange = (value) => {
    let newDate = new Date(value);
    setDateSporządzenia(newDate);
  };

  const handleViewChange = () => {
    isTarczaView ? prepareRamka() : prepareRamkaTarcza4();
    setTarczView(!isTarczaView);

  }

  const handleOrganChange= (value) => {
    if(value) {
      setOrganProwadzacy(true);
      setNumber('P.1425.2020');
      setNumberTarcza('GKN-I.');
    } else {
      setOrganProwadzacy(false);
      setNumber('P.1463.2020');
      setNumberTarcza('Gd.III.6642.2.');
    }
  }

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
              <label>skala ramki: </label>
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
              <button onClick={() => deegrees < 360 ? setDeegrees(deegrees + 90) : setDeegrees(90)}>Rotacja</button>
            </div>
            <div>
              <button onClick={() => handleViewChange()}>Zmień ramkę</button>
            </div>
            
            <input type="radio" 
            id="miasto" 
            value={organProwadzacy} 
            onChange={() => handleOrganChange(false)}
            checked={!organProwadzacy}
            />
            <label htmlFor="miasto">Miasto</label>
            <input type="radio" id="wies"  
            checked={organProwadzacy}
            value={organProwadzacy}  onChange={() => handleOrganChange(true)}/>
            <label htmlFor="wies">Wieś</label>

            {isTarczaView &&
            <div>
              <label>Id ewidencyjny materiału: </label>
              <input
                type="text"
                value={numberTarcza}
                onChange={(event) => setNumberTarcza(event.target.value)}
              />
            </div> }

            <div>
              <label>numer roboty: </label>
              <input
                type="text"
                value={number}
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
            {isTarczaView &&
            <div>
              <label>data sporządzenia: </label>
              <input
                type="date"
                defaultValue={moment(dateSporządzenia).format("YYYY-MM-DD")}
                onChange={(event) => {
                  handleDateSporządzeniaChange(event.target.value.toString());
                }}
              />
            </div>}
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
