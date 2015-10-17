class PlayerStats(object):
  def __init__(self, **kwargs):
    self.health = kwargs.get('health', 1)
    self.strength = kwargs.get('strength', 1)
    self.intelligence = kwargs.get('intelligence', 1)
    self.is_addicted = kwargs.get('is_addicted', False)
    self.is_immortal = kwargs.get('is_immortal', False)
    self.addiction_probability = kwargs.get('addiction_probability', 0.5)
