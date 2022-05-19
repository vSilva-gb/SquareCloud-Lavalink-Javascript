/**
 * Code created by Silva
 * Before making any modification, check if it is really necessary and allowed.
 * Attention: When making any modification to this code you must give credit.
 */

//Variables
const os = require("os"),
  systemOS = os.platform(),
  { mkdirSync, existsSync, unlinkSync, copyFile, rmSync } = require("fs"),
  { spawn, spawnSync } = require("child_process"),
  { ramTotal } = require("@squarecloud/status"),
  config = require("./config.js");

//Function to check if the code is running on Linux
if (systemOS !== "linux") {
  console.log("This script is only for linux");
  process.exit(1);
}

//Main function
const run = async () => {
  //Try to check the plan's available RAM.
  let ram = 0;
  try {
    ram = ramTotal();
  } catch (error) {
    //If error, go to catch.
    console.log(
      "🔴 RAM check is currently unavailable. (Remembering that this only works on SquareCloud Hosting Service)"
    );
  }
  //If your plan's available ram is less than 512MB, log
  if (ram < 512) {
    console.log(
      "🔴 RAM is less than 512MB. (Remembering that this only works on SquareCloud Hosting Service)"
    );
  }

  //If uninstall is true, delete all necessary files from lavalink to work and reinstall.
  if (config["uninstall"]) {
    console.log("🔵 Uninstalling...");
    rmSync("./squareLava", { recursive: true });
    console.log("🟢 Uninstalled.");
  }

  //downloads Lavalink from the site that is in config.lavaLink checks if the status is indifferent to 0 (greater than 0 is an error) if there is a process exit and notify the user with a log
  if (!existsSync("./squareLava/Lavalink/Lavalink.jar")) {
    console.log("🔵 Downloading Lavalink...");
    mkdirSync("./squareLava/Lavalink", { recursive: true });
    //Function to download lavalink
    const downLava = spawnSync(
      "wget",
      ["-c", "-O", "Lavalink.jar", config.lavalink],
      { encoding: "utf-8", cwd: "./squareLava/Lavalink" }
    );
    //If the status is 0, no error occurred.
    if (downLava.status !== 0) {
      console.log(
        "🔴 Lavalink download failed. (Check the console for more information)"
      );
      return process.exit(downLava.status);
    }
    console.log("🟢 Lavalink downloaded.");
  }

  //downloads Lavalink from the site that is in config.openJDK.link checks if the status is indifferent to 0 (greater than 0 is an error) if there is a process exit and notify the user with a log
  if (!existsSync(`./squareLava/Java/jdk-${config.openJDK.version}/bin/java`)) {
    console.log(`🔵 Downloading Java ${config["openJDK"]["version"]}...`);
    mkdirSync("./squareLava/Java", { recursive: true });
    //Checks if application.yml is already set correctly
    if (!existsSync("./squareLava/Lavalink/application.yml")) {
      //If not, copy what is in the root to the Lavalink folder
      copyFile(
        "./application.yml",
        "./squareLava/Lavalink/application.yml",
        (err) => {
          if (err) console.error(err);
          return process.exit(1);
        }
      );
    }
    //Function to download Java.
    const downJava = spawnSync(
      "wget",
      [config.openJDK.link, "-O", "java.tar.gz"],
      { encoding: "utf-8", cwd: "./squareLava/Java" }
    );
    if (downJava.status !== 0) {
      console.log(
        "🔴 Java download failed. (Check the console for more information)"
      );
      return process.exit(downJava.status);
    }
    console.log("🟢 Java downloaded.\n🔵 Extracting Java...");

    //The java comes zipped, extract the java.tar.gz into the java folder and delete the compressed file and use console.log for each step.
    const extractJava = spawnSync("tar", ["-xvzf", "java.tar.gz"], {
      encoding: "utf8",
      cwd: "./squareLava/Java",
    });
    if (extractJava.status !== 0) {
      console.log(
        "🔴 Java extraction failed. (Check the console for more information)"
      );
      return process.exit(extractJava.status);
    }
    console.log("🟢 Java extraction complete");

    //Delete the compressed java file and check if any errors occurred.
    console.log("🔵 Deleting Java archive...");
    unlinkSync("./squareLava/Java/java.tar.gz");
    if (existsSync("./squareLava/Java/java.tar.gz")) {
      console.log(
        "🔴 Java archive deletion failed. (Check the console for more information)"
      );
      return process.exit(1);
    }
    console.log("🟢 Java archive deleted");
  }

  //Start lavalink, check if there was an error and if error 127 occurs, delete the java folder and kill the process.
  console.log("🔵 Starting Lavalink...");
  const urlJava =
    process.cwd() + `/squareLava/Java/jdk-${config.openJDK.version}/bin/java`;
  const startLava = spawn(urlJava, ["-jar", "Lavalink.jar"], {
    cwd: "./squareLava/Lavalink",
  });

  //Print lavalink logs if active in config.json.
  if (config.lavalinklogs) {
    startLava.stdout.on("data", (data) => {
      console.log(`${data}`);
    });
    startLava.stderr.on("data", (data) => {
      console.error(`${data}`);
    });
  }

  startLava.on("close", async (code) => {
    console.log(`🔴 Lavalink failed to start. (Error code: ${code})`);
    if (code === 127) {
      rmSync("./squareLava/Java", { recursive: true });
      return process.exit(code);
    }
  });
  await delay(20 * 1000);
  console.log("🟢 Lavalink has been successfully started.");

  //Checks if the bot folder exists and checks if the mainFile file configured in config.js exists inside it
  console.log("🔵 Checking the files...");
  if (!existsSync(`./bot/${config["mainFile"]}`)) {
    console.log("🔴 The main file in config.json was not found.");
    return process.exit(1);
  }

  //Install all bot dependencies.
  console.log("🔵 Installing dependencies...");
  const npm = spawnSync("npm", ["i"], { cwd: "./bot", encoding: "utf-8" });
  if (npm.status !== 0) {
    console.log(
      "🔴 Dependencies installation failed. (Check the console for more information)"
    );
    return process.exit(1);
  }
  console.log("🟢 Dependencies installed.\n🟢 Starting bot...");
  const runNode = spawn("node", [config["mainFile"]], {
    cwd: "./bot",
    encoding: "utf-8",
  });
  runNode.stdout.on("data", (data) => {
    console.log(`${data}`);
  });
  runNode.stderr.on("data", (data) => {
    console.error(`${data}`);
  });
  //Checks if the bot has crashed.
  runNode.on("close", () => {
    console.error(
      "🔴 The bot has crashed. (Check the console for more information)"
    );
    return process.exit(1);
  });
};

//Function to create a delay defined by user
const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

run();
