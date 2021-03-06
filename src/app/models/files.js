const db = require('../../config/db');
const fs = require('fs');
const { checkToDelete } = require('../../libs/utils');
module.exports = {
    async create(data){
        const query = `
            INSERT INTO files(
            name,
            path
            ) VALUES($1, $2)
            RETURNING id
        `;
        const values = [
            data.filename,
            data.path,
        ]
        const result =  await db.query(query, values);
        return result.rows[0].id;
    },
    createReferenceRecipeImages(recipe_id, file_id){
        const query = `
        INSERT INTO recipe_files(
        recipe_id,
        file_id
        ) VALUES($1, $2)
        RETURNING id
    `;
    const values = [
        recipe_id,
        file_id,
    ]
    return db.query(query, values);
    },
    async getFiles(id){
        const result = await db.query(`SELECT * FROM files WHERE id = $1`, [id]);
        return result.rows[0];
    },
    async getAllFilesIdFromRecipe(recipeId){
        query = `SELECT file_id FROM recipe_files WHERE recipe_id = $1`;
        
        let result = await db.query(query, [recipeId]);
        return result.rows;

    },
    async getIdRecipesFiles(id){
            const result = await db.query(`SELECT file_id FROM recipe_files WHERE recipe_id = $1`, [id]);
            return result.rows[0];
    },
    async delete(id){
        const result = await db.query(`SELECT * FROM files WHERE id = $1`, [id]);
        const file = result.rows[0];
        if(!checkToDelete(file.path))
            fs.unlinkSync(file.path);
        
        const deleteFromTAbleRecipesFiles = await db.query(`DELETE FROM recipe_files WHERE file_id = $1;`,[id]);
        const deleteFromTableFiles = await db.query(`DELETE FROM files WHERE id = $1`, [id]);

        return deleteFromTAbleRecipesFiles, deleteFromTableFiles;
    },
    async deleteChefImg(id){
        const result = await db.query(`SELECT * FROM files WHERE id = $1`, [id]);
        const file = result.rows[0];
        await db.query(`DELETE FROM files WHERE id = $1`, [id]);
        if(!checkToDelete(file.path))
            fs.unlinkSync(file.path);

        return;
    }
}