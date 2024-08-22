const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName');
const fileSizeDisplay = document.getElementById('fileSize');
const sendButton = document.getElementById('sendButton');
const qrCodeContainer = document.querySelector('.qr-code-container');
const qrCodeImage = document.getElementById('qrCode');
const downloadLinkDisplay = document.getElementById('downloadLink');
const downloadButton = document.getElementById('downloadButton');
const copyButton = document.getElementById('copyButton');

fileInput.addEventListener('change', displayFileName);
sendButton.addEventListener('click', generateQRCode);
downloadButton.addEventListener('click', downloadFile);
copyButton.addEventListener('click', copyDownloadLink);

function displayFileName() {
    const file = fileInput.files[0];
    if (file) {
        fileNameDisplay.innerHTML = `Arquivo selecionado: <strong>${file.name}</strong>`;
        const fileSize = formatFileSize(file.size);
        fileSizeDisplay.textContent = `Tamanho do arquivo: ${fileSize}`;
    }
}

function formatFileSize(size) {
    if (size < 1024) {
        return size + ' bytes';
    } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + ' KB';
    } else if (size < 1024 * 1024 * 1024) {
        return (size / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
        return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
}

async function shortenURL(longUrl) {
    try {
        const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`);
        if (response.ok) {
            const data = await response.json();
            return data.shorturl;
        } else {
            throw new Error('Erro ao encurtar a URL');
        }
    } catch (error) {
        console.error('Erro ao encurtar a URL:', error);
        return longUrl; // Retorna o URL original em caso de erro
    }
}

async function copyDownloadLink() {
    const downloadLink = document.getElementById("downloadButton").getAttribute("href");
    const fileName = document.getElementById("fileName").textContent.replace('Arquivo selecionado: ', '').replace('<strong>', '').replace('</strong>', '');

    // Gerar um link para a página de informações do arquivo
    const infoPageLink = `https://qr-share-theta.vercel.app/informacoes-do-arquivo.html?name=${encodeURIComponent(fileName)}&link=${encodeURIComponent(downloadLink)}`;

    try {
        const shortUrl = await shortenURL(infoPageLink);
        // Copiar o link encurtado para a área de transferência
        const tempInput = document.createElement("input");
        tempInput.value = shortUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);

        // Exibir mensagem de sucesso
        const copyMessage = document.createElement("p");
        copyMessage.textContent = "Link copiado com sucesso!";
        copyMessage.classList.add("copy-message");
        document.body.appendChild(copyMessage);

        // Remover mensagem após alguns segundos
        setTimeout(() => {
            document.body.removeChild(copyMessage);
        }, 3000);
    } catch (error) {
        console.error('Erro ao encurtar a URL:', error);
    }
}

function generateQRCode() {
    const file = fileInput.files[0];
    if (file) {
        const fileReader = new FileReader();
        fileReader.onload = async function(event) {
            const fileData = event.target.result;
            const qrCodeData = 'data:' + file.type + ';base64,' + fileData.split(',')[1];

            // Calcular o tamanho do arquivo
            const fileSize = file.size;

            // Armazenar os dados do arquivo e o tamanho em localStorage
            window.localStorage.setItem('fileData', qrCodeData);
            window.localStorage.setItem('fileSize', fileSize);

            // URL da página de informações do arquivo
            const infoPageUrl = `https://qr-share-theta.vercel.app/informacoes-do-arquivo.html?name=${encodeURIComponent(file.name)}`;

            // Criar um link que inclui a URL da página de informações
            const qrCodeLink = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(infoPageUrl)}`;

            qrCodeImage.src = qrCodeLink;
            qrCodeContainer.style.display = 'block';

            const downloadLink = qrCodeData;
            downloadButton.href = downloadLink;
            downloadButton.download = file.name;
            downloadButton.style.display = 'block';
            copyButton.style.display = 'block';

            // Passar os dados do arquivo para a página de informações
            const infoPageLink = `https://qr-share-theta.vercel.app/informacoes-do-arquivo.html?name=${encodeURIComponent(file.name)}&size=${fileSize}`;
            window.localStorage.setItem('infoPageLink', infoPageLink);
        }
        fileReader.readAsDataURL(file);
    }
}

function downloadFile() {
    const file = fileInput.files[0];
    if (file) {
        const blob = new Blob([file], { type: file.type });
        const url = URL.createObjectURL(blob);
        downloadButton.href = url;
        downloadButton.download = file.name;
    }
}
