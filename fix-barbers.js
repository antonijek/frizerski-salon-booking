const db = require("./backend/db");

// Restore original image URLs and work_days
const barbers = [
    {
        id: 1,
        name: "Marko Peric",
        image_url:
            "https://scontent-cdg4-2.xx.fbcdn.net/v/t39.30808-6/515509901_10233470619980973_3345442632780592906_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=9eae26&_nc_ohc=u2Enq3_i3ksQ7kNvwFJS5D_&_nc_oc=AdqZr5WIf-B1CGrlErF50Xbq3NaboDuDBBLx0VE-4e98sMNiM1m64WWG2SS3svTINj0&_nc_zt=23&_nc_ht=scontent-cdg4-2.xx&_nc_gid=C1BxmK1UBHCqTtX_iNYVGA&_nc_ss=7b2a8&oh=00_Af41--ksmO8VXFvDFBzgzSyN-zyQrASft-I28IPweS-SCw&oe=6A190FB7",
        title: "Majstor",
        bio: "Sa velikim iskustvom u inostranstvu, sad sisa i nas.",
        work_days: "1,2,3,4,5,6",
        work_start: "14:00",
        work_end: "21:00",
        is_active: 1,
    },
    {
        id: 2,
        name: "Jovana Maric",
        image_url:
            "https://scontent-fra3-2.xx.fbcdn.net/v/t39.30808-6/468305922_10160194540961290_7165060660573063890_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=VHayw7DPZosQ7kNvwEKPe3u&_nc_oc=AdqszmzgkrrxabIPK6_EvDYoaahPivCKo2bkrIjYFLQMbaXfgk9UMigXaaAbo8MKQuQ&_nc_zt=23&_nc_ht=scontent-fra3-2.xx&_nc_gid=P4rYwX1PFTdT3shQHi0pWQ&_nc_ss=7b2a8&oh=00_Af6rq-s1szea6w-czYGllbpdKck64HmnmzaaQLAAwgiihQ&oe=6A192566",
        title: "Frizerka",
        bio: "Legenda u ovom poslu.",
        work_days: "1,2,3,5,6,4",
        work_start: "08:00",
        work_end: "16:00",
        is_active: 1,
    },
    {
        id: 4,
        name: "Cakana Kekic",
        image_url:
            "https://scontent-fra5-2.xx.fbcdn.net/v/t39.30808-6/463892762_10230178210512794_5640272246422518099_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=gh5lp-qL_mEQ7kNvwE10Xx6&_nc_oc=AdoDBUtyZf6zS2Lcv8LUDYUNQ_Mpth1y2taR3eAvJrdmVobTF9xFYPGix_qcBSxL6VI&_nc_zt=23&_nc_ht=scontent-fra5-2.xx&_nc_gid=KyGqtiO66emEoo3-Ze7ABw&_nc_ss=7b2a8&oh=00_Af52-giuve44duIqyXZ7epdlNO8neYN8RC9wCmPfy1uOMQ&oe=6A192BBC",
        title: "Frizer",
        bio: "Preko 10 godina iskustva i hiljade zadovoljnih korisnika...",
        work_days: "1,2,5,3,4",
        work_start: "10:00",
        work_end: "18:00",
        is_active: 1,
    },
];

async function fix() {
    for (const b of barbers) {
        const sql =
            "UPDATE barbers SET name = ?, image_url = ?, title = ?, bio = ?, is_active = ?, work_days = ?, work_start = ?, work_end = ? WHERE id = ?";
        await new Promise((resolve, reject) => {
            db.query(
                sql,
                [
                    b.name,
                    b.image_url,
                    b.title,
                    b.bio,
                    b.is_active,
                    b.work_days,
                    b.work_start,
                    b.work_end,
                    b.id,
                ],
                (err, result) => {
                    if (err) {
                        console.error(`Error updating ${b.name}:`, err);
                        reject(err);
                    } else {
                        console.log(`✅ Updated ${b.name} (id: ${b.id})`);
                        resolve(result);
                    }
                },
            );
        });
    }
    console.log("✅ All barbers restored!");
    process.exit(0);
}

fix();
