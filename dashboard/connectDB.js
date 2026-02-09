const path = require("path");

const dirConfig = path.join(`${__dirname}/../Shourov.json`);
const dirConfigCommands = path.join(`${__dirname}/../configCommands.json`);

global.GoatBot = {
        config: require(dirConfig),
        configCommands: require(dirConfigCommands)
};
global.utils = require("../utils.js");
global.client = {
        database: {
                creatingThreadData: [],
                creatingUserData: [],
                creatingDashBoardData: []
        }
};
global.db = {
        allThreadData: [],
        allUserData: [],
        globalData: []
};

module.exports = async function () {
        const controllerPath = path.join(process.cwd(), "shourov_fca_database/controller/index.js");
        if (!require("fs").existsSync(controllerPath)) {
                return {
                        threadModel: null,
                        userModel: null,
                        dashBoardModel: null,
                        globalModel: null,
                        threadsData: [],
                        usersData: [],
                        dashBoardData: [],
                        globalData: []
                };
        }
        const controller = await require(controllerPath)(null); // data is loaded here
        const { threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData } = controller;
        return {
                threadModel,
                userModel,
                dashBoardModel,
                globalModel,
                threadsData,
                usersData,
                dashBoardData,
                globalData
        };
};