import { apiPostRaw } from "/shared/js/api.js";

function wireDrop(dropEl, fileInput, browseBtn, resultEl, endpoint) {
  browseBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) handleFile(fileInput.files[0]);
  });

  ["dragenter", "dragover"].forEach((evt) =>
    dropEl.addEventListener(evt, (e) => {
      e.preventDefault();
      dropEl.classList.add("drag-over");
    })
  );
  ["dragleave", "drop"].forEach((evt) =>
    dropEl.addEventListener(evt, (e) => {
      e.preventDefault();
      dropEl.classList.remove("drag-over");
    })
  );
  dropEl.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  async function handleFile(file) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      resultEl.textContent = "Please choose a .csv file.";
      return;
    }
    resultEl.textContent = "Uploading…";
    try {
      const text = await file.text();
      const data = await apiPostRaw(endpoint, text, "admin");
      resultEl.textContent = `Imported ${data.result.ok} row(s)` + (data.result.failed ? `, ${data.result.failed} failed` : "");
    } catch (e) {
      resultEl.textContent = e.message || "Import failed";
    }
  }
}

export function initCsvImport({ studentDrop, studentFile, studentBrowseBtn, studentResult, subjectDrop, subjectFile, subjectBrowseBtn, subjectResult, gradesDrop, gradesFile, gradesBrowseBtn, gradesResult }, onDone) {
  wireDrop(studentDrop, studentFile, studentBrowseBtn, studentResult, "/api/import/students");
  wireDrop(subjectDrop, subjectFile, subjectBrowseBtn, subjectResult, "/api/import/subjects");
  wireDrop(gradesDrop, gradesFile, gradesBrowseBtn, gradesResult, "/api/import/grades");
  studentFile.addEventListener("change", () => setTimeout(onDone, 800));
  subjectFile.addEventListener("change", () => setTimeout(onDone, 800));
  gradesFile.addEventListener("change", () => setTimeout(onDone, 800));
  studentDrop.addEventListener("drop", () => setTimeout(onDone, 800));
  subjectDrop.addEventListener("drop", () => setTimeout(onDone, 800));
  gradesDrop.addEventListener("drop", () => setTimeout(onDone, 800));
}
