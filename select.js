/* AADHAYA — Selection highlight (select.js)
   Dealer jo chune woh saaf dikhe:
   - Product page: chuna hua SIZE / FINISH button gold me bhar jaata hai (safed text).
   - Quick Order table: finish ke saamne size wale khane par tap → woh khana + uski size row
     aur finish column halke gold me; quantity bharte hi khana gold me bhar jaata hai.
   Sirf rang badalta hai — rate, stock, cart ka koi logic nahi chhuta.
   Hatana ho to: index.html se iski <script> line hata dijiye. */
(function () {
"use strict";
var G = "#C8A84A", GD = "#A8892F", GS = "rgba(200,168,74,.14)";
var css =
/* product page buttons */
".sheet .opts .opt.on,.sheet .opts .opt.u-has.on,.opts .opt.on{background:" + G + "!important;border-color:" + G + "!important;color:#fff!important;font-weight:700!important;box-shadow:0 6px 16px -8px rgba(168,137,47,.9),inset 0 0 0 1px " + GD + "!important}" +
".opts .opt.on .sw{border-color:#fff!important;box-shadow:0 0 0 1.5px rgba(255,255,255,.85)}" +
".opts .opt{transition:background .2s,color .2s,border-color .2s,box-shadow .2s,transform .35s!important}" +
/* quick order table — quantity bhara hua khana */
".u-mx input.has{background:" + G + "!important;border-color:" + G + "!important;color:#fff!important;font-weight:700}" +
".u-mx input.has.stk{box-shadow:inset 0 -3px 0 #22A45D}" +
/* quick order table — abhi tap kiya hua khana */
".u-mx input:focus{border-color:" + G + "!important;background:#FFF8E6;box-shadow:0 0 0 3px rgba(200,168,74,.35)!important}" +
".u-mx input.has:focus{background:" + GD + "!important;color:#fff!important}" +
/* uski size row + finish column */
".sheet .u-mx tr.u-selr td{background:" + GS + "!important}" +
".sheet .u-mx tr.u-selr td:first-child{background:#FBF3DC!important;color:" + GD + "!important;box-shadow:inset 3px 0 0 " + G + "}" +
".u-mx th.u-selc{color:" + GD + "!important;background:#FBF3DC!important;box-shadow:inset 0 -3px 0 " + G + "}" +
".sheet .u-mx td.u-selc{background:" + GS + "!important}" +
/* legend */
".u-leg i.h{background:" + G + "!important;border-color:" + G + "!important}";

var st = document.createElement("style"); st.id = "aadSelect"; st.textContent = css;
(document.head || document.documentElement).appendChild(st);

function clear(tb) {
  var x = tb.querySelectorAll(".u-selr,.u-selc");
  for (var i = 0; i < x.length; i++) x[i].classList.remove("u-selr", "u-selc");
}
function mark(inp) {
  var td = inp.closest("td"), tr = inp.closest("tr"), tb = inp.closest("table");
  if (!td || !tr || !tb) return;
  clear(tb);
  tr.classList.add("u-selr");
  var c = td.cellIndex, th = tb.tHead && tb.tHead.rows[0] && tb.tHead.rows[0].cells[c];
  if (th) th.classList.add("u-selc");
  for (var r = 0; r < tb.tBodies[0].rows.length; r++) {
    var cell = tb.tBodies[0].rows[r].cells[c];
    if (cell && cell !== td) cell.classList.add("u-selc");
  }
}
document.addEventListener("focusin", function (e) {
  var t = e.target; if (t && t.matches && t.matches(".u-mx input")) mark(t);
});
document.addEventListener("focusout", function (e) {
  var t = e.target; if (!t || !t.matches || !t.matches(".u-mx input")) return;
  var tb = t.closest("table");
  setTimeout(function () { var a = document.activeElement; if (tb && !(a && tb.contains(a))) clear(tb); }, 0);
});
})();
