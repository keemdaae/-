
const postgres = require('postgres');

const sql = postgres(process.env.NETLIFY_DATABASE_URL, {
  ssl: 'require',
});

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    const newData = JSON.parse(event.body);
    
    // key='main'인 행을 찾아 데이터를 업데이트하거나, 없으면 새로 삽입 (Upsert)
    await sql`
      INSERT INTO portfolio_settings (key, data)
      VALUES ('main', ${newData})
      ON CONFLICT (key) DO UPDATE SET data = ${newData}
    `;
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Cloud Sync Successful' }),
    };
  } catch (error) {
    console.error('DB Save Error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
