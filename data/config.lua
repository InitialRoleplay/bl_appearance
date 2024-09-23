Config = {
    locale = 'fr',
    openControl = 'E',
    previousClothing = 'illenium', -- 'illenium' | 'qb' | 'esx' | 'fivem-appearance'
    textUi = true, -- if true, uses textUI | if false, uses sprite
    outfitItem = 'clothes_outfits', -- Item given to the player when they want to make outfit an item to use
}

exports('config', function()
    return Config
end)

---@param state boolean If true, hides the HUD. If false, shows the HUD.
exports('hideHud', function(state)
    local event = state and 'ts_hud:client:showHud' or 'ts_hud:client:hideHUD'
    TriggerEvent(event)
end)
