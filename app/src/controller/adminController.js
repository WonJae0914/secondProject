"use strict"

const MongoClient = require('mongodb-legacy').MongoClient;

let db;
MongoClient.connect("mongodb+srv://kdKim:6r7r6e5!KD@cluster0.mo9rckf.mongodb.net/?retryWrites=true&w=majority"
    , { useNewUrlParser: true },
    function (err, client) {
        if (err) { return console.log('DB연결 실패'); }
        db = client.db('test');
        console.log("몽고디비 연결 성공");
    });

//관리자 홈
const adminHome = (req, res) => {   //
    res.render('admin_home.ejs');
};

// 관리자 게시판 글쓰기 겟
const adminWriteG = (req, res) => {
    res.render('admin_write.ejs');
};
// 관리자 게시판 글쓰기 포스트
const adminWriteP = async function (req, res) {
    const result = await db.collection('counter').findOne({ name: '게시물 개수' });
    console.log(result.totalpost);
    const total = result.totalpost;
    const put = {
        _id: total + 1,
        // 작성자: req.user._id,
        제목: req.body.title,
        설명: req.body.description,
        작성날짜: new Date().toLocaleString(),
        경로: "/movies/" + req.files.profile[0].filename,
        사진경로: "/img/" + req.files.profileImg[0].filename,
        삭제: "N",
        삭제날짜: "N"
    };
    const result2 = await db.collection('post').insertOne(put);
    console.log('저장완료');
    const result3 = await db.collection('counter').updateOne(
        { name: '게시물 개수' },
        { $inc: { totalpost: 1 } }
    );
    res.redirect('/admin/list');
};

// 관리자 게시판 리스트
const adminList = async (req, res) => {
    const result = await db.collection('post').find({ 삭제: 'N' }).toArray();
    res.render('admin_list.ejs', { posts: result });
}

// 관리자 게시판 상세보기
const adminDetail = async (req, res) => {
    const result = await db.collection('post').findOne({ _id: parseInt(req.params.id) })
    res.render('admin_detail.ejs', { data: result });
};

//관리자 게시판 삭제(fake)
const adminDelete = async (req, res) => {
    const result = await db.collection('post').updateOne({ _id: parseInt(req.body._id) },
        {
            $set:
            {
                삭제: 'Y',
                삭제날짜: new Date().toLocaleString()
            }
        });
    const message = await function () {
        console.log("삭제완료")
    }
    return message();
}

//관리자 게시판 수정 겟
const adminPutG = async (req, res) => {
    const result = await db.collection('post').findOne({ _id: parseInt(req.params.id) });
    res.render('admin_edit.ejs', { post: result })
}
//관리자 게시판 수정 포스트
const adminPutP = async (req, res) => {
    req.body._id = parseInt(req.body._id);
    const result = await db.collection('post').updateOne({ _id: parseInt(req.body.id) },
        {
            $set:
            {
                제목: req.body.title,
                설명: req.body.description,
                수정날짜: new Date().toLocaleString(),
            }
        });
    const message = function () {
        console.log("수정완료");
        res.redirect("/admin/list")
    }
    return message();
}

module.exports = {
    adminHome, adminWriteG, adminWriteP,
    adminList, adminDetail, adminDelete,
    adminPutG, adminPutP
}
