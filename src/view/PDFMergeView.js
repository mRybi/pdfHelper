import React, { useState } from "react";
import { asyncForEach } from "../helpers/asyncForEach";
import { PDFDocument, degrees, StandardFonts } from "pdf-lib";
import { FileDisplay } from "../components/FileDisplay/FileDisplay";

function PDFMergeView() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState([]);

  let arr = [];
  let filess = [];

  const handleFileRead = (e) => {
    const content = e.target.result;
    arr.push(content);
    if (arr.length === filess.length) {
      setFiles(arr);
    }
  };

  const handleChange = (files) => {
    let fileArray = Array.from(files);
    filess = Array.from(fileArray);

    fileArray.forEach((file) => {
      let fileReader = new FileReader();
      fileReader.onload = handleFileRead;
      fileReader.readAsArrayBuffer(file);
    });
  };

  const prepareMergedPDF = async () => {
    console.log("bytes", files);
    const pdfDoc = await PDFDocument.create();

    await asyncForEach(files, async (f) => {
      let pdf = await PDFDocument.load(f);
      let [contentPage] = await pdfDoc.copyPages(pdf, [0]);
      let embeddedPageContent = await pdfDoc.embedPage(contentPage);
      const page = pdfDoc.addPage([
        embeddedPageContent.width,
        embeddedPageContent.height,
      ]);
      page.drawPage(embeddedPageContent, {
        height: embeddedPageContent.height,
        width: embeddedPageContent.width,
        x: 1,
        y: 1,
      });

      if (page.getWidth() > page.getHeight()) {
        page.setRotation(degrees(90));
      }
    });

    const pdfBytes = await pdfDoc.save();
    setResult(pdfBytes);
  };

  return (
    <div className="App">
      <header className="App-header">
        {files.length > 0 && <button type="submit" onClick={async () => await prepareMergedPDF()}>
          RUN
        </button>}

        <div className="row">
          {result.length > 0 && <FileDisplay bytes={result} />}
          <div className="column">
            <div>
              <label> plik pdf: </label>
              <input
                type="file"
                onChange={(event) => handleChange(event.target.files)}
                accept=".pdf"
                multiple={true}
              ></input>
            </div>
            {files.map((f, index) => (
              <FileDisplay key={index} bytes={f} />
            ))}
          </div>
        </div>
      </header>
    </div>
  );
}

export default PDFMergeView;
