const { app, BrowserWindow, Menu, Tray, ipcMain, shell } = require('electron')
const path = require('path')
const url = require('url')

// Debug options
const Debug = {
    DevTool: true,
}

// Start the program when app is ready
app.on('ready', function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        title: app.name,
        show: false, // Show and maximize later
        icon: path.join(__dirname, 'assets', 'icons', 'main_icon.png'),
        resizable: false,
        useContentSize: true,
        width: 400,
        height: 100,
        webPreferences: {
            nodeIntegration: true
        }
    })

    // Create the menu
    const menu = Menu.buildFromTemplate([{
            label: 'File',
            submenu: [{
                // Quit
                label: 'Quit',
                accelerator: 'ctrl+q',
                click() {
                    win.close()
                }
            }, ]
        },
        {
            label: 'Actions',
            // Options to use the timer
            submenu: [{
                    label: 'Play/Pause',
                    click() { win.webContents.send('Play_Pause') },
                    accelerator: 'Space'
                },
                {
                    label: 'Reset',
                    click() { win.webContents.send('Reset') },
                    accelerator: 'Ctrl+R'
                },
            ]
        },
        {
            label: 'Help',
            // Allow opening browser dev tool
            submenu: [{
                    label: 'DevTool',
                    accelerator: 'Ctrl+D',
                    enabled: Debug.DevTool,
                    visible: Debug.DevTool,
                    click() {
                        win.webContents.toggleDevTools()
                    }
                },
                {
                    label: 'Privacy Policy',
                    click() {
                        let link = 'https://raotech3.blogspot.com/2019/12/rtimer-privacy-policy.html'
                        shell.openExternal(link)
                    }
                },
                {
                    label: app.name + ' version ' + app.getVersion(),
                }
            ]
        }
    ])

    // Set menu
    Menu.setApplicationMenu(menu)

    // Create a tray icon
    tray = new Tray(path.join(__dirname, 'assets', 'icons', 'main_icon.png'))

    // Create a conext menu for the tray
    const tray_menu = Menu.buildFromTemplate([{
            label: 'Restore',
            click() {
                win.show()
            }
        },
        {
            label: 'Quit',
            click() {
                win.close()
            }
        }
    ])

    // Set the tray menu and tooltip
    tray.setContextMenu(tray_menu)
    tray.setToolTip(app.name)

    // Load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'src', 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Hide the window when minimized
    win.on('minimize', function(event) {
        // This is causing crash when win.show() is used while app is not in focus.
        // event.preventDefault();
        // win.hide();
    });

    // Show the window when the tray icon is double clicked
    tray.on('double-click', () => {
        win.show()
    })

    // When the timer end is received from index page, show the window
    // Set it always on top and then disable on top after 1 seconds
    ipcMain.on('timer_end', () => {
        win.show()
        win.setAlwaysOnTop(true)
        setTimeout(() => { win.setAlwaysOnTop(false) }, 1000)
    })

    // Perform actions after window is loaded
    win.webContents.on('did-finish-load', () => {
        // Show and maximize
        win.show()
    })
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})