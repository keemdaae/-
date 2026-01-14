
const postgres = require('postgres');

// Netlify에 등록한 환경 변수를 사용하여 DB 연결
const sql = postgres(process.env.NETLIFY_DATABASE_URL, {
  ssl: 'require',
});

exports.handler = async (event, context) => {
  try {
    const result = await sql`SELECT data FROM portfolio_settings WHERE key = 'main' LIMIT 1`;
    
    if (result.length === 0) {
      return { 
        statusCode: 200, 
        body: JSON.stringify(null) 
      };
    }
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result[0].data),
    };
  } catch (error) {
    console.error('DB Fetch Error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
