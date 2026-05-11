import { Pool } from "pg";
let pool = null;
export const getDatabaseUrl = () => process.env.DATABASE_URL ?? "";
export const getPool = () => {
    if (!pool) {
        pool = new Pool({
            connectionString: getDatabaseUrl(),
        });
    }
    return pool;
};
export const isDatabaseConfigured = () => getDatabaseUrl().length > 0;
export const isDatabaseReady = async () => {
    const client = await getPool().connect();
    try {
        await client.query("select 1");
        return true;
    }
    catch {
        return false;
    }
    finally {
        client.release();
    }
};
export const query = async (text, params = []) => {
    const result = await getPool().query(text, params);
    return result.rows;
};
export const queryOne = async (text, params = []) => {
    const rows = await query(text, params);
    return rows[0] ?? null;
};
export const withTransaction = async (operation) => {
    const client = await getPool().connect();
    try {
        await client.query("begin");
        const result = await operation(client);
        await client.query("commit");
        return result;
    }
    catch (error) {
        await client.query("rollback");
        throw error;
    }
    finally {
        client.release();
    }
};
