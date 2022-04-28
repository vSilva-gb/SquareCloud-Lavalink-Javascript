const os = require('os'),
    systemOS = os.platform(),
    { readdirSync, mkdirSync, existsSync, unlinkSync, rename, appendFileSync, copyFile, copyFileSync, rmdir, rmdirSync} = require('fs'),
    { spawn, spawnSync } = require('child_process'),
    square = require('squarecloud-status'),
    config = require('./config.json');

if (systemOS !== 'linux') {
    console.log('This script is only for linux');
    process.exit(1);
}

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
        console.log('🔴 RAM is less than 512MB. (Remembering that this only works on SquareCloud Hosting Service);');
    }

    if (config['uninstall']) {
        console.log('🔵 Uninstalling...');
        rmdirSync('./squareLava', { recursive: true });
        console.log('🟢 Uninstalled.');
    }

    //baixa o Lavalink do site que esta em config.lavaLink verifica se o status é indiferente de 0 caso seja da um process exit e da um console.log.
    if (!existsSync('./squareLava/Lavalink/Lavalink.jar')) {
        console.log('🔵 Downloading Lavalink...');
        mkdirSync('./squareLava/Lavalink', { recursive: true });
        //Faz o download do lavalink
        const downLava = spawnSync("wget", ['-c', '-O', "Lavalink.jar", config.lavalink], {encoding: "utf-8", cwd: "./squareLava/Lavalink"});
        //Se o status for 0, não aconteceu nenhum erro
        if (downLava.status !== 0) {
            console.log('🔴 Lavalink download failed. (Check the console for more information)');
            return process.exit(downLava.status);
        }
        console.log('🟢 Lavalink downloaded.');
    }

    //baixa o java do site que está em config.javaLink verifica se o status é indiferente de 0 e extraia o arquivo.
    if (!existsSync(`./squareLava/Java/jdk-${config.openJDK.version}/bin/java`)) {
        console.log(`🔵 Downloading Java ${config["openJDK"]["version"]}...`);
        mkdirSync('./squareLava/Java', { recursive: true });
        const downJava = spawnSync('wget', [config.openJDK.link, '-O', 'java.tar.gz'], {encoding: 'utf-8', cwd: './squareLava/Java'});
        if (downJava.status !== 0) {
            console.log('🔴 Java download failed. (Check the console for more information)');
            return process.exit(downJava.status);
        }
        console.log('🟢 Java downloaded.\n🔵 Extracting Java...');
    
        //extrai o java.tar.gz para dentro da pasta java e apague o arquivo comprimido e use console.log para cada etapa.
        const extractJava = spawnSync('tar', ['-xvzf', 'java.tar.gz'], {encoding: 'utf8', cwd: './squareLava/Java'});
        if (extractJava.status !== 0) {
            console.log('🔴 Java extraction failed. (Check the console for more information)');
            return process.exit(extractJava.status);
        };
        console.log('🟢 Java extraction complete');

        //Apague o arquivo do java comprimido e verifique se ocorreu algum erro.
        console.log('🔵 Deleting Java archive...');
        unlinkSync('./squareLava/Java/java.tar.gz');
        if (existsSync('./squareLava/Java/java.tar.gz')) {
            console.log('🔴 Java archive deletion failed. (Check the console for more information)');
            return process.exit(1);
        }
        console.log('🟢 Java archive deleted');
    }

    //Inicia o lavalink, verifica se ocorreu algum erro e case ocorra o erro 127 apague a pasta do java e mate o processo.
    console.log('🔵 Starting Lavalink...');
    const urlJava = process.cwd() + `/squareLava/Java/jdk-${config.openJDK.version}/bin/java`;
    let startLava = spawn(urlJava, ['-jar', 'Lavalink.jar'], {cwd: './squareLava/Lavalink'});
    startLava.stdout.on('data', (data) => {
        console.log(`${data}`);
    });
    startLava.stderr.on('data', (data) => {
        console.log(`${data}`);
    });
            
    //Verifique se ocorreu algum erro e case ocorra o erro 127 apague a pasta do java e mate o processo.
    startLava.on('exit', (code) => {
        //se o erro for 127 apague a pasta do java e mate o processo.
        if (code === 127) {
            console.log('🔴 Lavalink start failed. (Check the console for more information)');
            unlinkSync('./squareLava/Java/jdk-16');
            return process.exit(code);
        }
        console.log('🟢 Lavalink has been successfully started.');
    });

    //Delay para esperar o serviço do Lavalink iniciar.
    await delay(20*1000);

    //Verifica se a existe a pasta bot e verifica se dentro dela existe o arquivo index.js.
    console.log('🔵 Starting the bot.');
    if (!existsSync(`./bot/${config["mainFile"]}`)) {
        console.log('🔴 The main file in config.json was not found.');
        return process.exit(1);
    }

    //Instala todas as dependências do bot.
    console.log('🔵 Installing dependencies...');
    const npm = spawnSync('npm', ['i'], { cwd: './bot', encoding: 'utf-8' });
    if (npm.status !== 0) {
        console.log('🔴 Dependencies installation failed. (Check the console for more information)');
        return process.exit(1);
    };
    console.log('🟢 Dependencies installed.');
    const runNode = spawn('node', [config['mainFile'], { encoding: 'utf-8', cwd: './bot' }]);
    runNode.stdout.on('data', (data) => {
        console.log(`${data}`);
    });
    runNode.stderr.on('data', (data) => {
        console.log(`${data}`);
    });
    //Verifica se o bot caiu.
    runNode.on('close', (code) => {
        console.error('🔴 The bot has crashed. (Check the console for more information)');
        process.exit(code);
    })
}

//crie uma função que cria um delay com tempo personalizado.
const delay = (time) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

run();