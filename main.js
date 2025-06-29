// 各入力フォーム、ボタン等の要素を取得
const content = document.getElementById("content")
const date = document.getElementById("date")
const time = document.getElementById("time")
const image = document.getElementById("image")
const button = document.getElementById("button")
const taskSpace = document.getElementById("task-space")
const imagePreview = document.getElementById("image-preview")
const previewImg = document.getElementById("preview-img")
const removeImageBtn = document.getElementById("remove-image")

// task格納用
let tasks = []
let selectedImageData = null

// currentTimeの方が大きければ期日を過ぎたことになる
const currentTime = new Date().getTime()

// 画像ファイルをBase64に変換する関数
const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 画像選択時の処理
image.addEventListener("change", async function(e) {
  const file = e.target.files[0]
  if (file) {
    try {
      selectedImageData = await convertImageToBase64(file)
      previewImg.src = selectedImageData
      imagePreview.style.display = "block"
    } catch (error) {
      alert("画像の読み込みに失敗しました")
      console.error(error)
    }
  }
})

// 画像削除ボタンの処理
removeImageBtn.addEventListener("click", function() {
  selectedImageData = null
  image.value = ""
  imagePreview.style.display = "none"
})

// taskの表示
const displayTasks = () => {
  let htmlTags = ""
  tasks.map((t, index) => {
    const isOver = currentTime >= t.timelimit
    const taskClass = isOver ? "over" : ""
    const imageHtml = t.imageData ? `<img src="${t.imageData}" class="task-image" alt="タスク画像">` : ""
    
    htmlTags += `
      <div class="task-item ${taskClass}">
        <p>${index + 1}: ${t.content}, ${new Date(t.timelimit)}</p>
        ${imageHtml}
      </div>
    `
  })
  taskSpace.innerHTML = htmlTags
}

// taskの消去
document.getElementById("all-clear").addEventListener("click", function() {
  tasks = []; // タスク配列を空にする
  localStorage.removeItem("local-tasks"); // ローカルストレージからタスクを削除
  displayTasks(); // タスク表示を更新
});

// localStorageに存在するかどうかの確認
// 存在すればそのままtasksに格納
const localTasks = localStorage.getItem("local-tasks")

if (!localTasks) {
  // ローカルストレージにtaskが無い時
  console.log("none")
} else {
  // ローカルストレージにタスクがある時
  // ローカルストレージから取り出すときはJSON.parse()
  tasks = JSON.parse(localTasks)
  displayTasks()
}

// unix時間を導き出すための関数
// 入力された日付・時間を結合して数値の配列に変え、返り値にする
const createDatetimeArray = (date, time) => {
    const datetimearr = []
    // dateをハイフン(-)で年・月・時に分割
    const datearr = date.split("-")
    // timeをコロン(:)で時・分に分割
    const timearr = time.split(":")
    // 二つの配列を結合したのち数値に変換→空の配列に格納
    const tmparr = datearr.concat(timearr)
    tmparr.map(t => {
      datetimearr.push(Number(t))
    })
    // 返した配列でunix時間へ変換
    return datetimearr
  }

// task追加の関数
const addTask = () => {
    // 入力フォームの存在性チェック
    if (!content.value || !date.value || !time.value) {
      alert("全項目を入力してください")
    } else {
      const timearr = createDatetimeArray(date.value, time.value)
      // taskに格納する際、unix時間にする
      // new Dateに日時を指定する際、月だけ1少ない数じゃないと翌月になる
      const limitdate = new Date(timearr[0], timearr[1]-1, timearr[2], timearr[3], timearr[4])
      
      // タスクオブジェクトを作成（画像データも含める）
      const taskObject = {
        content: content.value, 
        timelimit: limitdate.getTime(),
        imageData: selectedImageData
      }
      
      // ローカルへ保存前にtasksに格納する
      tasks.push(taskObject)
      // ローカルストレージに格納するときはJSON.stringify()
      localStorage.setItem("local-tasks", JSON.stringify(tasks))
      
      // フォームをリセット
      content.value = ""
      date.value = ""
      time.value = ""
      image.value = ""
      selectedImageData = null
      imagePreview.style.display = "none"
      
      displayTasks()
    }
  }
  
  // フォームに入力してボタンを押したらtasksに追加
  button.addEventListener("click", addTask);