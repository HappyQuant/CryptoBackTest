# BackTestTools - 交易回测框架核心代码
# 参考 https://github.com/HappyQuant/BackTestTools
# 此文件包含所有核心模块，用户策略只需继承IStrategy并实现run方法

from decimal import Decimal
from collections import deque
from datetime import datetime
from enum import Enum

# ==================== 枚举定义 ====================

class OrderType(Enum):
    """订单类型"""
    BUY = "buy"
    SELL = "sell"

class OrderSide(Enum):
    """订单方向"""
    LONG = "long"
    SHORT = "short"

class PositionSide(Enum):
    """持仓方向"""
    LONG = "long"
    SHORT = "short"
    BOTH = "both"

# ==================== K线数据类 ====================

class Kline:
    """K线数据结构"""
    def __init__(self, data: dict):
        self.open_time = data.get('open_time', '')
        self.open = float(data.get('open', 0))
        self.high = float(data.get('high', 0))
        self.low = float(data.get('low', 0))
        self.close = float(data.get('close', 0))
        self.volume = float(data.get('volume', 0))
        self.close_time = data.get('close_time', '')
    
    def __repr__(self):
        return f"<Kline(open_time={self.open_time}, close={self.close})>"

# ==================== K线缓存类 ====================

class KlineCache:
    """K线数据缓存，用于存储历史K线"""
    def __init__(self, kline_wnd_size: int = 50):
        self.kline_wnd_size = kline_wnd_size
        self.klines = deque(maxlen=kline_wnd_size)
    
    def append(self, kline: Kline):
        """添加一根K线到缓存"""
        self.klines.append(kline)
    
    def get_klines(self) -> list:
        """获取所有K线"""
        return list(self.klines)
    
    def get_closes(self) -> list:
        """获取所有收盘价"""
        return [k.close for k in self.klines]
    
    def get_highs(self) -> list:
        """获取所有最高价"""
        return [k.high for k in self.klines]
    
    def get_lows(self) -> list:
        """获取所有最低价"""
        return [k.low for k in self.klines]
    
    def get_volumes(self) -> list:
        """获取所有成交量"""
        return [k.volume for k in self.klines]
    
    def get_opens(self) -> list:
        """获取所有开盘价"""
        return [k.open for k in self.klines]
    
    def is_full(self) -> bool:
        """检查缓存是否已填满"""
        return len(self.klines) >= self.kline_wnd_size
    
    def __len__(self):
        return len(self.klines)

# ==================== 订单类 ====================

class Order:
    """订单数据结构"""
    def __init__(
        self,
        timestamp: str,
        order_type: OrderType,
        price: float,
        amount: float,
        fee: float = 0,
        order_side: OrderSide = None
    ):
        self.timestamp = timestamp
        self.type = order_type
        self.price = float(price)
        self.amount = float(amount)
        self.fee = float(fee)
        self.order_side = order_side
    
    def __repr__(self):
        return f"<Order(type={self.type.value}, price={self.price}, amount={self.amount})>"

# ==================== 回测上下文类 ====================

class BacktestContext:
    """
    回测上下文类
    管理账户余额、持仓、订单记录和手续费计算
    """
    def __init__(self, initial_balance: float, fee_rate: float = 0.001):
        # 使用 Decimal 确保计算精度
        self.initial_balance = Decimal(str(initial_balance))
        self.balance = Decimal(str(initial_balance))
        self.position = Decimal('0')  # 持仓数量
        self.fee_rate = Decimal(str(fee_rate))
        
        # 手续费统计
        self.base_fee = Decimal('0')
        self.quote_fee = Decimal('0')
        
        # 买入成本（用于计算持仓均价）
        self.buy_cost = Decimal('0')
        
        # 交易记录
        self.trades = []
        self.orders = []
        
        # 权益曲线
        self.equity_curve = []
        
        # 回撤计算
        self.max_drawdown = Decimal('0')
        self.highest_balance = self.initial_balance
        
        # 资产历史
        self.balance_history = []
        self.position_history = []
    
    def buy(self, price: float, amount: float, timestamp: str) -> bool:
        """
        买入订单
        :param price: 买入价格
        :param amount: 买入数量
        :param timestamp: 订单时间戳
        :return: 是否成功
        """
        price = Decimal(str(price))
        amount = Decimal(str(amount))
        total_cost = price * amount
        fee = total_cost * self.fee_rate
        
        if self.balance >= total_cost + fee and amount > 0:
            self.balance -= total_cost + fee
            self.position += amount
            self.quote_fee += fee
            
            order = Order(timestamp, OrderType.BUY, price, amount, fee)
            self.orders.append(order)
            
            self.trades.append({
                'timestamp': timestamp,
                'type': 'buy',
                'price': float(price),
                'amount': float(amount),
                'balance': float(self.balance),
                'fee': float(fee)
            })
            
            self.buy_cost += total_cost
            self.update_equity_curve(timestamp, price)
            self.record_history()
            
            return True
        return False
    
    def sell(self, price: float, amount: float, timestamp: str) -> bool:
        """
        卖出订单
        :param price: 卖出价格
        :param amount: 卖出数量
        :param timestamp: 订单时间戳
        :return: 是否成功
        """
        price = Decimal(str(price))
        amount = Decimal(str(amount))
        
        if self.position >= amount and amount > 0:
            total_revenue = price * amount
            fee = total_revenue * self.fee_rate
            
            self.balance += total_revenue - fee
            self.position -= amount
            self.quote_fee += fee
            
            order = Order(timestamp, OrderType.SELL, price, amount, fee)
            self.orders.append(order)
            
            self.trades.append({
                'timestamp': timestamp,
                'type': 'sell',
                'price': float(price),
                'amount': float(amount),
                'balance': float(self.balance),
                'fee': float(fee)
            })
            
            self.update_equity_curve(timestamp, price)
            self.record_history()
            
            return True
        return False
    
    def sell_all(self, price: float, timestamp: str) -> bool:
        """卖出全部持仓"""
        if self.position > 0:
            return self.sell(price, float(self.position), timestamp)
        return False
    
    def get_position_value(self, price: float) -> Decimal:
        """获取持仓价值"""
        return self.position * Decimal(str(price))
    
    def get_equity(self, price: float) -> Decimal:
        """获取账户权益"""
        return self.balance + self.get_position_value(price)
    
    def get_avg_position_price(self) -> float:
        """获取平均持仓价格"""
        if self.position > 0:
            return float(self.buy_cost / self.position)
        return 0.0
    
    def get_drawdown(self, current_price: float) -> Decimal:
        """计算当前回撤"""
        current_price = Decimal(str(current_price))
        equity = self.get_equity(current_price)
        if self.highest_balance > 0:
            return (self.highest_balance - equity) / self.highest_balance
        return Decimal('0')
    
    def update_equity_curve(self, timestamp: str, current_price: float):
        """更新权益曲线"""
        current_price = Decimal(str(current_price))
        equity = self.get_equity(current_price)
        
        self.equity_curve.append({
            'timestamp': timestamp,
            'equity': float(equity),
            'balance': float(self.balance),
            'position': float(self.position)
        })
        
        if equity > self.highest_balance:
            self.highest_balance = equity
        
        drawdown = (self.highest_balance - equity) / self.highest_balance
        if drawdown > self.max_drawdown:
            self.max_drawdown = drawdown
    
    def record_history(self):
        """记录历史状态"""
        self.balance_history.append(float(self.balance))
        self.position_history.append(float(self.position))
    
    def get_result(self, final_price: float) -> dict:
        """获取回测结果"""
        final_price = Decimal(str(final_price))
        final_equity = self.get_equity(final_price)
        profit = final_equity - self.initial_balance
        profit_rate = profit / self.initial_balance if self.initial_balance > 0 else Decimal('0')
        
        win_trades = 0
        total_sell_trades = 0
        last_buy_price = None
        
        for trade in self.trades:
            if trade['type'] == 'buy':
                last_buy_price = trade['price']
            elif trade['type'] == 'sell' and last_buy_price is not None:
                total_sell_trades += 1
                if trade['price'] > last_buy_price:
                    win_trades += 1
        
        win_rate = win_trades / total_sell_trades if total_sell_trades > 0 else 0
        
        return {
            'initialBalance': float(self.initial_balance),
            'finalBalance': float(final_equity),
            'profit': float(profit),
            'profitRate': float(profit_rate),
            'maxDrawdown': float(self.max_drawdown),
            'totalTrades': len(self.trades),
            'winRate': win_rate,
            'baseAsset': float(self.position),
            'quoteAsset': float(self.balance),
            'baseFee': float(self.base_fee),
            'quoteFee': float(self.quote_fee),
            'trades': self.trades,
            'equityCurve': self.equity_curve
        }
    
    def __repr__(self):
        return f"<BacktestContext(balance={self.balance}, position={self.position})>"

# ==================== 策略基类 ====================

class IStrategy:
    """
    策略基类
    用户策略必须继承此类并实现run方法
    """
    def __init__(self):
        self.kline_cache = None
        self.name = self.__class__.__name__
    
    def initialize(self, kline_wnd_size: int = 50):
        """初始化K线缓存"""
        self.kline_cache = KlineCache(kline_wnd_size)
    
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        """
        策略执行方法（需要子类实现）
        :param context: 回测上下文
        :param kline: 当前K线数据
        :param params: 策略参数
        """
        raise NotImplementedError("子类必须实现run方法")
    
    def on_trade(self, trade: dict):
        """交易触发回调"""
        pass
    
    def on_day_end(self, date: str, context: BacktestContext):
        """每日结束回调"""
        pass

# ==================== 回测执行器 ====================

def run_backtest(strategy_code: str, kline_data_list: list, params: dict) -> dict:
    """
    执行回测
    :param strategy_code: 用户策略代码
    :param kline_data_list: K线数据列表
    :param params: 回测参数
    :return: 回测结果
    """
    if not kline_data_list:
        return {
            'initialBalance': params.get('initialBalance', 10000),
            'finalBalance': params.get('initialBalance', 10000),
            'profit': 0,
            'profitRate': 0,
            'maxDrawdown': 0,
            'totalTrades': 0,
            'winRate': 0,
            'baseAsset': 0,
            'quoteAsset': params.get('initialBalance', 10000),
            'baseFee': 0,
            'quoteFee': 0,
            'trades': [],
            'equityCurve': []
        }
    
    # 创建全局命名空间
    global_ns = {
        'IStrategy': IStrategy,
        'KlineCache': KlineCache,
        'Kline': Kline,
        'Order': Order,
        'OrderType': OrderType,
        'BacktestContext': BacktestContext,
        'deque': deque,
        'Decimal': Decimal,
        'datetime': datetime
    }
    
    local_ns = {}
    
    # 执行用户策略代码
    exec(strategy_code, global_ns, local_ns)
    
    # 获取Strategy类
    Strategy = local_ns.get('Strategy')
    if Strategy is None:
        raise NameError("Strategy class not found in strategy code")
    
    # 创建策略实例
    strategy = Strategy()
    
    # 初始化策略
    kline_wnd_size = params.get('strategyParams', {}).get('klineWndSize', 50)
    strategy.initialize(kline_wnd_size)
    
    # 创建回测上下文
    context = BacktestContext(
        params.get('initialBalance', 10000),
        params.get('feeRate', 0.001)
    )
    
    # 执行回测
    for kline_data in kline_data_list:
        kline = Kline(kline_data)
        
        # 更新K线缓存
        if strategy.kline_cache:
            strategy.kline_cache.append(kline)
        
        # 执行策略
        strategy.run(context, kline, params.get('strategyParams', {}))
        
        # 更新权益曲线
        context.update_equity_curve(kline.open_time, kline.close)
    
    # 获取最终价格
    final_price = kline_data_list[-1]['close']
    
    return context.get_result(final_price)

# ==================== 工具函数 ====================

def calculate_sma(data: list, period: int) -> float:
    """计算简单移动平均线"""
    if len(data) < period:
        return None
    return sum(data[-period:]) / period

def calculate_ema(data: list, period: int) -> float:
    """计算指数移动平均线"""
    if len(data) < period:
        return None
    
    multiplier = 2 / (period + 1)
    ema = sum(data[:period]) / period
    
    for price in data[period:]:
        ema = (price - ema) * multiplier + ema
    
    return ema

def calculate_rsi(data: list, period: int = 14) -> float:
    """计算RSI指标"""
    if len(data) < period + 1:
        return None
    
    gains = []
    losses = []
    
    for i in range(1, period + 1):
        change = data[-i] - data[-i-1]
        if change > 0:
            gains.append(change)
            losses.append(0)
        else:
            gains.append(0)
            losses.append(abs(change))
    
    avg_gain = sum(gains) / len(gains)
    avg_loss = sum(losses) / len(losses)
    
    if avg_loss == 0:
        return 100
    
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))

def calculate_macd(data: list, fast: int = 12, slow: int = 26, signal: int = 9) -> tuple:
    """计算MACD指标"""
    if len(data) < slow:
        return None, None, None
    
    ema_fast = calculate_ema(data, fast)
    ema_slow = calculate_ema(data, slow)
    
    if ema_fast is None or ema_slow is None:
        return None, None, None
    
    macd_line = ema_fast - ema_slow
    
    # 计算signal线需要macd的历史数据，这里简化处理
    signal_line = macd_line * 0.9  # 简化
    histogram = macd_line - signal_line
    
    return macd_line, signal_line, histogram

# 导出所有模块
__all__ = [
    'Kline', 'KlineCache', 'Order', 'OrderType', 'OrderSide',
    'BacktestContext', 'IStrategy', 'run_backtest',
    'calculate_sma', 'calculate_ema', 'calculate_rsi', 'calculate_macd'
]
