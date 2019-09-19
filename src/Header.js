let  Header = {
    length: 40,
    ctx: Buffer.allocUnsafe(40)
}
Header.ctx.write("[             H E A D E R    1234567890]",0)

export default Header;