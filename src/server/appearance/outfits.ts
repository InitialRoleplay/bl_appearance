import { oxmysql } from "@overextended/oxmysql";
import { config, core, getFrameworkID, onClientCallback } from "../utils";
import { Outfit } from "@typings/outfits";
import { TAppearance, TDrawables, TValue } from "@typings/appearance";

async function getOutfits(src: number, frameworkId: string) {
    const job = core.GetPlayer(src).job || { name: 'unknown', grade: { name: 'unknown' } }

    try {
        let response = await oxmysql.prepare('SELECT * FROM outfits WHERE player_id = ? OR (jobname = ? AND jobrank <= ?)', [frameworkId, job.name, job.grade.name]);

        if (!response || response.length === 0) {
            return [];
        }

        if (!Array.isArray(response)) response = [response];

        const outfits = response.map(
            (outfit: { id: number; label: string; outfit: string; jobname?: string }) => {
                return {
                    id: outfit.id,
                    label: outfit.label,
                    outfit: JSON.parse(outfit.outfit),
                    jobname: outfit.jobname,
                };
            }
        );

        return outfits;

    } catch (error) {
        console.error('An error occurred while fetching outfits:', error);
        return [];
    }
}
onClientCallback('bl_appearance:server:getOutfits', getOutfits);
exports('GetOutfits', getOutfits);

async function renameOutfit(src: number, data: { id: number; label: string }) {
    const frameworkId = getFrameworkID(src);
    const result = await oxmysql.update(
        'UPDATE outfits SET label = ? WHERE player_id = ? AND id = ?',
        [data.label, frameworkId, data.id]
    );
    return result;
}
onClientCallback('bl_appearance:server:renameOutfit', renameOutfit);
exports('RenameOutfit', renameOutfit);

async function deleteOutfit(src: number, id: number) {
    const result = await oxmysql.update(
        'DELETE FROM outfits WHERE id = ?',
        [id]
    );
    return result > 0;
}
onClientCallback('bl_appearance:server:deleteOutfit', deleteOutfit);
exports('DeleteOutfit', deleteOutfit);

async function saveOutfit(src: number, data: Outfit) {
    const frameworkId = getFrameworkID(src);
    let jobname = null;
    let jobrank = 0;
    if (data.job) {
        jobname = data.job.name;
        jobrank = data.job.rank;
    }
    const id = await oxmysql.insert(
        'INSERT INTO outfits (player_id, label, outfit, jobname, jobrank) VALUES (?, ?, ?, ?, ?)',
        [frameworkId, data.label, JSON.stringify(data.outfit), jobname, jobrank]
    );
    return id;
}
onClientCallback('bl_appearance:server:saveOutfit', saveOutfit);
exports('SaveOutfit', saveOutfit);


async function fetchOutfit(_: number, id: number) {
    const response = await oxmysql.prepare(
        'SELECT outfit FROM outfits WHERE id = ?',
        [id]
    );
    return JSON.parse(response[0]);
}
onClientCallback('bl_appearance:server:fetchOutfit', fetchOutfit);
exports('FetchOutfit', fetchOutfit);

async function importOutfit(_: number, frameworkId: string, outfitId: number, outfitName: string) {
    const result = await oxmysql.query(
        'SELECT label, outfit FROM outfits WHERE id = ?',
        [outfitId]
    );

    if (!result || typeof result !== 'object' || Object.keys(result).length === 0) {
        return { success: false, message: 'Outfit not found' };
    }

    const outfit = result[0].outfit;

    const newId = await oxmysql.insert(
        'INSERT INTO outfits (player_id, label, outfit) VALUES (?, ?, ?)',
        [frameworkId, outfitName, outfit]
    );

    return { success: true, id: newId, outfit: JSON.parse(outfit), label: outfitName };
}
onClientCallback('bl_appearance:server:importOutfit', importOutfit);
exports('ImportOutfit', importOutfit);

const outfitItem = config.outfitItem

if (!outfitItem) {
    console.warn('bl_appearance: No outfit item configured, please set it in config.lua')
}

onClientCallback('bl_appearance:server:itemOutfit', async (src, data) => {
    const player = core.GetPlayer(src)
    player.addItem(outfitItem, 1, data)
});

onClientCallback('bl_appearance:server:payAppearance', async (src: number, appearance: TAppearance, original: TAppearance, outfit: boolean) => {
    const player = core.GetPlayer(src)

    let hasMoney = (player.getBalance('cash') >= config.outfitCost) ? 'cash' : (player.getBalance('bank') >= config.outfitCost) ? 'bank' : false
    if (!hasMoney) {
        return false
    }
    player.removeBalance(hasMoney, config.outfitCost)

    if (!outfit) {
        const diff = {
            drawables: Object.entries(appearance.drawables)
                .filter(([key, item]) => {
                    const originalItem = original.drawables[key];
                    return !originalItem ||
                        item.value !== originalItem.value ||
                        item.texture !== originalItem.texture;
                })
                .map(([key, item]) => ({ ...item, id: key })),

            props: Object.entries(appearance.props)
                .filter(([key, item]) => {
                    const originalItem = original.props[key];
                    return !originalItem ||
                        item.value !== originalItem.value ||
                        item.texture !== originalItem.texture;
                })
                .map(([key, item]) => ({ ...item, id: key }))
        }

        diff.drawables.forEach((item) => {
            player.addItem('clothes_' + item.id, 1, item)
        })

        diff.props.forEach((item) => {
            player.addItem('clothes_' + item.id, 1, item)
        })
    } else {
        player.addItem(outfitItem, 1, {
            outfit: {
                props: appearance.props,
                drawables: appearance.drawables,
            },
        })
    }
});