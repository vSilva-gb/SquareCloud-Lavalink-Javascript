const os = require('os'),
    systemOS = os.platform(),
    { readdirSync, mkdirSync, existsSync, unlinkSync, rename, appendFileSync, copyFile, copyFileSync} = require('fs'),
    { spawn, spawnSync } = require('child_process'),
    square = require('squarecloud-status'),
    config = require('./config.json');

let runLava,
    runNode;

/*if (systemOS !== 'linux') {
    console.log('This script is only for linux');
    process.exit(1);
}*/

const run = async () => {
    //Verifica a ram disponivel da host.
    let ram = 0;
    try {
        //Tenta verificar a ram disponivel da host.
        ram = square.ramTotal();
    } catch (error) {
        //Se não conseguir, vai para o catch.
        console.log('🔴 RAM check is currently unavailable. (Remembering that this script is for linux)');
    }
    //Se a ram for menor que o 512MB, vai para o catch.
    if (ram < 512) {
        console.log('🔴 RAM is less than 512MB. (The minimum recommended is 512MB)');
    }

    //Cria o diretorio Lavalink e Java e verifica se ocorreu algum erro e use console log em cada
    const pastas = ['./Lavalink', './Java']
    for await (const pasta of pastas) {
        if(!existsSync(pasta)) {
            try {
                mkdirSync(pasta)
            } catch(err) {
                console.log(`🔴 Error creating ${pasta}`);
                return process.exit(1);
            }
        }
    }
    console.log('🔵 Folders created');

    //baixa o Lavalink do site que esta em config.lavaLink verifica se o status é indiferente de 0 caso seja da um process exit e da um console.log.
    console.log('🔵 Downloading Lavalink...');
    const downLava = spawn("wget", ['-c', '-O', "Lavalink.jar", config.lavalink], {encoding: "utf-8", cwd: "./Lavalink"});
    //imprime o console log do wget em tempo real.
    downLava.stdout.on('data', (data) => {
        console.log(data);
    });
    //imprime o console log do wget em tempo real.
    downLava.stderr.on('data', (data) => {
        console.log(data);
    });
    return
    console.log(downLava.status)
    if (downLava.status !== 0) {
        console.log('🔴 Lavalink download failed. (Check the console for more information)');
        return process.exit(1);
    }
    console.log('🟢 Lavalink downloaded.');

    //baixa o java do site que está em config.javaLink verifica se o status é indiferente de 0 e extraia o arquivo.
    console.log('🔵 Downloading Java...');
    const downJava = spawn('wget', [config.javaLink, '-O', 'java.tar.gz']);
    if (downJava.status !== 0) {
        console.log('🔴 Java download failed. (Check the console for more information)');
        return process.exit(1);
    }
    console.log('🟢 Java downloaded.');
    
    //extrai o java.tar.gz para dentro da pasta java e apague o arquivo comprimido e use console.log para cada etapa.
    console.log('🔵 Extracting Java...');
    const extractJava = spawn('tar', ['xvzf', 'java.tar.gz'], {encoding: 'utf8', cwd: './Java'});
    extractJava.on('exit', (code) => {
        if (code !== 0) {
            console.log('🔴 Java extraction failed. (Check the console for more information)');
            process.exit(1);
        }
        console.log('🔵 Java extraction complete');
    });

    //Apague o arquivo do java comprimido e verifique se ocorreu algum erro.
    console.log('🔵 Deleting Java archive...');
    unlinkSync('java.tar.gz');
    if (existsSync('java.tar.gz')) {
        console.log('🔴 Java archive deletion failed. (Check the console for more information)');
        process.exit(1);
    }
    console.log('🔵 Java archive deleted');

    //Inicia o lavalink, verifica se ocorreu algum erro e case ocorra o erro 127 apague a pasta do java e mate o processo.
    console.log('🔵 Starting Lavalink...');
    const urlJava = process.cwd() + `/Java/jdk-${config.openJDK.version}/bin/java`;
    const startLava = spawn(urlJava, ['-jar', 'lavalink.jar'], {cwd: './Lavalink'});
    //Verifique se ocorreu algum erro e case ocorra o erro 127 apague a pasta do java e mate o processo.
    startLava.on('exit', (code) => {
        //se o erro for 127 apague a pasta do java e mate o processo.
        if (code === 127) {
            console.log('🔴 Lavalink start failed. (Check the console for more information)');
            unlinkSync('./Java/jdk-16');
            process.exit(1);
        }
        console.log('🔵 Lavalink start complete');
    });






}

//create a async function.

run();