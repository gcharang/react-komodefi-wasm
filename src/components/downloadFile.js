const DownloadFile = (fileContent, fileType, fileName) => {
  const blob = new Blob([fileContent], { type: fileType });
  const url = URL.createObjectURL(blob);

  // Create a temporary link element
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  // Clean up and remove the link
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default DownloadFile;
