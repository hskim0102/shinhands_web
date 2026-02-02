import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Database connection
const databaseUrl = process.env.DATABASE_URL;
let sql;

if (databaseUrl) {
    try {
        sql = neon(databaseUrl);
        console.log('✅ Connected to Neon database');
    } catch (error) {
        console.error('❌ Failed to connect to Neon database:', error);
    }
} else {
    console.warn('⚠️ DATABASE_URL environment variable is not set');
}

// Routes

// Team Members
app.get('/api/team-members', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const result = await sql`
        SELECT 
          tm.id,
          tm.emp_id,
          tm.name,
          tm.role,
          tm.team_id as team,
          tm.mbti,
          tm.image_url as image,
          tm.description,
          tm.tags,
          COALESCE(
            array_agg(ms.value ORDER BY sc.sort_order) FILTER (WHERE ms.id IS NOT NULL),
            ARRAY[]::integer[]
          ) as stats
        FROM team_members tm
        LEFT JOIN member_stats ms ON tm.id = ms.member_id
        LEFT JOIN stat_categories sc ON ms.stat_category_id = sc.id
        GROUP BY tm.id, tm.name, tm.role, tm.team_id, tm.mbti, tm.image_url, tm.description, tm.tags, tm.emp_id
        ORDER BY COALESCE(tm.display_order, tm.id) ASC
    `;
        res.json(result);
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/team-members/:id', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const { id } = req.params;
        const result = await sql`
        SELECT 
          tm.id,
          tm.emp_id,
          tm.name,
          tm.role,
          tm.team_id as team,
          tm.mbti,
          tm.image_url as image,
          tm.description,
          tm.tags,
          COALESCE(
            array_agg(ms.value ORDER BY sc.sort_order) FILTER (WHERE ms.id IS NOT NULL),
            ARRAY[]::integer[]
          ) as stats
        FROM team_members tm
        LEFT JOIN member_stats ms ON tm.id = ms.member_id
        LEFT JOIN stat_categories sc ON ms.stat_category_id = sc.id
        WHERE tm.id = ${id}
        GROUP BY tm.id, tm.name, tm.role, tm.team_id, tm.mbti, tm.image_url, tm.description, tm.tags, tm.emp_id
    `;
        if (result.length === 0) return res.status(404).json({ error: 'Member not found' });
        res.json(result[0]);
    } catch (error) {
        console.error('Error fetching team member:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/team-members/login', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const { empId, password } = req.body;
        const result = await sql`
      SELECT id, name, emp_id, role, team_id, image_url, description
      FROM team_members 
      WHERE emp_id = ${empId} AND password = ${password}
    `;
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/team-members', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const memberData = req.body;
        const memberResult = await sql`
      INSERT INTO team_members (name, role, team_id, mbti, image_url, description, tags, emp_id, password)
      VALUES (${memberData.name}, ${memberData.role}, ${memberData.team || null}, ${memberData.mbti}, ${memberData.image}, ${memberData.description}, ${memberData.tags}, ${memberData.emp_id || null}, ${memberData.password || '0000'})
      RETURNING id
    `;
        const memberId = memberResult[0].id;

        if (memberData.stats && memberData.stats.length > 0) {
            for (let i = 0; i < memberData.stats.length; i++) {
                await sql`
          INSERT INTO member_stats (member_id, stat_category_id, value)
          VALUES (${memberId}, ${i + 1}, ${memberData.stats[i]})
        `;
            }
        }
        res.status(201).json({ id: memberId });
    } catch (error) {
        console.error('Error creating team member:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/team-members/:id', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const { id } = req.params;
        const memberData = req.body;

        await sql`
      UPDATE team_members 
      SET name = ${memberData.name}, role = ${memberData.role}, team_id = ${memberData.team || null}, 
          mbti = ${memberData.mbti}, image_url = ${memberData.image}, description = ${memberData.description}, 
          tags = ${memberData.tags}, emp_id = ${memberData.emp_id || null}, password = COALESCE(NULLIF(${memberData.password}, ''), password), updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

        if (memberData.stats && memberData.stats.length > 0) {
            for (let i = 0; i < memberData.stats.length; i++) {
                await sql`
          INSERT INTO member_stats (member_id, stat_category_id, value)
          VALUES (${id}, ${i + 1}, ${memberData.stats[i]})
          ON CONFLICT (member_id, stat_category_id)
          DO UPDATE SET value = ${memberData.stats[i]}, updated_at = CURRENT_TIMESTAMP
        `;
            }
        }
        res.json({ id });
    } catch (error) {
        console.error('Error updating team member:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/team-members/:id', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const { id } = req.params;
        await sql`DELETE FROM team_members WHERE id = ${id}`;
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/team-members/order', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const { items } = req.body;
        const queries = items.map((item, index) => {
            return sql`UPDATE team_members SET display_order = ${index} WHERE id = ${item.id}`;
        });
        await Promise.all(queries);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: error.message });
    }
});


// Board API
app.get('/api/posts', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const result = await sql`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.author_id,
        p.author_name as author,
        p.view_count,
        p.is_pinned,
        p.created_at::date::text as date,
        p.updated_at,
        bc.name as category
      FROM posts p
      JOIN board_categories bc ON p.category_id = bc.id
      WHERE p.is_deleted = FALSE
      ORDER BY p.is_pinned DESC, p.created_at DESC
    `;
        res.json(result);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/posts/:id', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const { id } = req.params;
        await sql`UPDATE posts SET view_count = view_count + 1 WHERE id = ${id}`;
        const result = await sql`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.author_id,
        p.author_name as author,
        p.view_count,
        p.is_pinned,
        p.created_at::date::text as date,
        p.updated_at,
        bc.name as category
      FROM posts p
      JOIN board_categories bc ON p.category_id = bc.id
      WHERE p.id = ${id} AND p.is_deleted = FALSE
    `;
        if (result.length === 0) return res.status(404).json({ error: 'Post not found' });
        res.json(result[0]);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/posts', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const postData = req.body;
        const result = await sql`
      INSERT INTO posts (title, content, author_id, author_name, category_id)
      VALUES (${postData.title}, ${postData.content}, ${postData.author_id || null}, ${postData.author}, 
              (SELECT id FROM board_categories WHERE name = ${postData.category}))
      RETURNING id
    `;
        res.status(201).json({ id: result[0].id });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/posts/:id', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const { id } = req.params;
        const postData = req.body;
        await sql`
      UPDATE posts 
      SET title = ${postData.title}, content = ${postData.content}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND is_deleted = FALSE
    `;
        res.json({ id });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/posts/:id', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const { id } = req.params;
        await sql`
      UPDATE posts 
      SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/board-categories', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const result = await sql`
      SELECT name, display_name, description, color
      FROM board_categories
      ORDER BY id
    `;
        res.json(result);
    } catch (error) {
        console.error('Error fetching board categories:', error);
        res.status(500).json({ error: error.message });
    }
});

// Comments
app.get('/api/posts/:postId/comments', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const { postId } = req.params;
        const result = await sql`
      SELECT id, post_id, author_name, content, created_at::text
      FROM comments
      WHERE post_id = ${postId}
      ORDER BY created_at ASC
    `;
        res.json(result);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/comments', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const commentData = req.body;
        const result = await sql`
      INSERT INTO comments (post_id, author_name, content)
      VALUES (${commentData.postId}, ${commentData.authorName}, ${commentData.content})
      RETURNING id, post_id, author_name, content, created_at::text
    `;
        res.status(201).json(result[0]);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: error.message });
    }
});

// Stats Categories
app.get('/api/stats-categories', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const result = await sql`
      SELECT name, display_name, description, sort_order
      FROM stat_categories
      ORDER BY sort_order
    `;
        res.json(result);
    } catch (error) {
        console.error('Error fetching stats categories:', error);
        res.status(500).json({ error: error.message });
    }
});

// Teams
app.get('/api/teams', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const result = await sql`
      SELECT id, name, description, color, created_at, updated_at
      FROM teams
      ORDER BY id
    `;
        res.json(result);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/teams/:teamId/members', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const { teamId } = req.params;
        const result = await sql`
        SELECT 
          tm.id,
          tm.emp_id,
          tm.name,
          tm.role,
          tm.team_id as team,
          tm.mbti,
          tm.image_url as image,
          tm.description,
          tm.tags,
          COALESCE(
            array_agg(ms.value ORDER BY sc.sort_order) FILTER (WHERE ms.id IS NOT NULL),
            ARRAY[]::integer[]
          ) as stats
        FROM team_members tm
        LEFT JOIN member_stats ms ON tm.id = ms.member_id
        LEFT JOIN stat_categories sc ON ms.stat_category_id = sc.id
        WHERE tm.team_id = ${teamId}
        GROUP BY tm.id, tm.name, tm.role, tm.team_id, tm.mbti, tm.image_url, tm.description, tm.tags, tm.emp_id
        ORDER BY COALESCE(tm.display_order, tm.id) ASC
    `;
        res.json(result);
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ error: error.message });
    }
});

// KPI
app.get('/api/kpis', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const result = await sql`SELECT * FROM kpis ORDER BY id ASC`;
        res.json(result);
    } catch (error) {
        console.error('Error fetching KPIs:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/kpis', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const kpiData = req.body;
        const result = await sql`
      INSERT INTO kpis (
        category, initiative, weight, indicator_item, indicator_weight, unit, target_2025, remarks,
        target_s, target_a, target_b_plus, target_b, target_b_minus, target_c, target_d, current_achievement
      ) VALUES (
        ${kpiData.category}, ${kpiData.initiative}, ${kpiData.weight}, 
        ${kpiData.indicator_item}, ${kpiData.indicator_weight}, ${kpiData.unit}, 
        ${kpiData.target_2025}, ${kpiData.remarks},
        ${kpiData.target_s || ''}, ${kpiData.target_a || ''}, ${kpiData.target_b_plus || ''}, 
        ${kpiData.target_b || ''}, ${kpiData.target_b_minus || ''}, ${kpiData.target_c || ''}, ${kpiData.target_d || ''},
        ${kpiData.current_achievement || ''}
      )
      RETURNING *
    `;
        res.status(201).json(result[0]);
    } catch (error) {
        console.error('Error creating KPI:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/kpis/:id', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const { id } = req.params;
        const kpiData = req.body;
        const result = await sql`
      UPDATE kpis SET
        category = ${kpiData.category},
        initiative = ${kpiData.initiative},
        weight = ${kpiData.weight},
        indicator_item = ${kpiData.indicator_item},
        indicator_weight = ${kpiData.indicator_weight},
        unit = ${kpiData.unit},
        target_2025 = ${kpiData.target_2025},
        remarks = ${kpiData.remarks},
        target_s = ${kpiData.target_s || ''},
        target_a = ${kpiData.target_a || ''},
        target_b_plus = ${kpiData.target_b_plus || ''},
        target_b = ${kpiData.target_b || ''},
        target_b_minus = ${kpiData.target_b_minus || ''},
        target_c = ${kpiData.target_c || ''},
        target_d = ${kpiData.target_d || ''},
        current_achievement = ${kpiData.current_achievement || ''},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
        res.json(result[0]);
    } catch (error) {
        console.error('Error updating KPI:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/kpis/:id', async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Database not connected' });
    try {
        const { id } = req.params;
        await sql`DELETE FROM kpis WHERE id = ${id}`;
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting KPI:', error);
        res.status(500).json({ error: error.message });
    }
});


// Export for Vercel
export default app;

// Start server if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}
