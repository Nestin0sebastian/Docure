document.getElementById("searchButton").addEventListener("click", function() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const tableRows = document.getElementsByTagName("tr");

    for (let i = 1; i < tableRows.length; i++) { // Start from 1 to skip the header row
      const row = tableRows[i];
      const userData = row.innerText.toLowerCase();

      if (userData.includes(searchTerm)) {
        row.style.display = "table-row";
      } else {
        row.style.display = "none";
      }
    }
  });